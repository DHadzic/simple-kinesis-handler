import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import { handler } from '../src/handler';
import { Callback, Context, KinesisStreamEvent, KinesisStreamRecord } from 'aws-lambda';
import { EventData, EventPayload, EventType, eventTypes } from '../src/types/events';
import * as common from '../src/common/common';
import { handlerUserLimitCreated } from '../src/handlers/userLimitCreated';
import { handlerUserLimitProgressChanged } from '../src/handlers/userLimitProgressChanged';
import { handlerUserLimitReset } from '../src/handlers/userLimitReset';
import {
  mockUserLimitCreatedPayload,
  mockUserLimitProgressChangedPayload,
  mockUserLimitResetPayload,
} from './__mocks__/events';

jest.mock('../src/handlers/userLimitCreated', () => ({
  handlerUserLimitCreated: jest.fn(),
}));

jest.mock('../src/handlers/userLimitProgressChanged', () => ({
  handlerUserLimitProgressChanged: jest.fn(),
}));

jest.mock('../src/handlers/userLimitReset', () => ({
  handlerUserLimitReset: jest.fn(),
}));

jest.mock('../src/common/common', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
  storage: {
    has: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('handler', () => {
  const mockHandlerUserLimitCreated = handlerUserLimitCreated as jest.MockedFunction<
    typeof handlerUserLimitCreated
  >;
  const mockHandlerUserLimitProgressChanged =
    handlerUserLimitProgressChanged as jest.MockedFunction<typeof handlerUserLimitProgressChanged>;
  const mockHandlerUserLimitReset = handlerUserLimitReset as jest.MockedFunction<
    typeof handlerUserLimitReset
  >;
  const mockLogger = common.logger as jest.Mocked<typeof common.logger>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockStreamEvent = (type: eventTypes | 'UNKNOWN_EVENT'): KinesisStreamRecord => {
    let payload: EventPayload = {} as unknown as EventPayload;

    if (type === eventTypes.USER_LIMIT_CREATED) {
      payload = mockUserLimitCreatedPayload;
    }

    if (type === eventTypes.USER_LIMIT_PROGRESS_CHANGED) {
      payload = mockUserLimitProgressChangedPayload;
    }

    if (type === eventTypes.USER_LIMIT_RESET) {
      payload = mockUserLimitResetPayload;
    }

    const eventData: EventData = {
      aggregateId: 'mock-aggregate-id',
      context: {},
      createdAt: Date.now(),
      eventId: 'mock-event-id',
      payload,
      sequenceNumber: 1,
      source: 'test',
      type: type as EventType,
    };

    return {
      kinesis: {
        data: Buffer.from(JSON.stringify(eventData)).toString('base64'),
        approximateArrivalTimestamp: 0,
        kinesisSchemaVersion: 'mock-schema-version',
        partitionKey: 'mock-partition-key',
        sequenceNumber: 'mock-sequence-number',
      },
      eventSource: 'mock-event-source',
      eventID: 'mock-event-id',
      invokeIdentityArn: 'mock-invoke-identity-arn',
      eventName: 'mock-event-name',
      eventVersion: 'mock-event-version',
      eventSourceARN: 'mock-event-source-arn',
      awsRegion: 'mock-region',
    } as KinesisStreamRecord;
  };

  const getRecordData = (record: KinesisStreamEvent, index = 0): EventData => {
    const data = Buffer.from(record.Records[index].kinesis.data, 'base64').toString('utf-8');
    return JSON.parse(data) as EventData;
  };

  test('should process USER_LIMIT_CREATED event correctly', async () => {
    const mockEvent: KinesisStreamEvent = {
      Records: [createMockStreamEvent(eventTypes.USER_LIMIT_CREATED)],
    };
    const eventData: EventData = getRecordData(mockEvent);

    await handler(mockEvent, {} as Context, {} as Callback);
    expect(mockHandlerUserLimitCreated).toHaveBeenCalledWith(eventData.payload);

    expect(mockHandlerUserLimitProgressChanged).not.toHaveBeenCalled();
    expect(mockHandlerUserLimitReset).not.toHaveBeenCalled();
  });

  test('should process multiple records correctly', async () => {
    const mockEvent: KinesisStreamEvent = {
      Records: [],
    };

    const RECORDS_COUNT = 5;
    for (let i = 0; i < RECORDS_COUNT; i++) {
      mockEvent.Records.push(createMockStreamEvent(eventTypes.USER_LIMIT_CREATED));
      mockEvent.Records.push(createMockStreamEvent(eventTypes.USER_LIMIT_PROGRESS_CHANGED));
    }
    mockEvent.Records.push(createMockStreamEvent(eventTypes.USER_LIMIT_RESET));

    const eventDataCreate: EventData = getRecordData(mockEvent, 0);
    const eventDataProcessChanged: EventData = getRecordData(mockEvent, 1);

    await handler(mockEvent, {} as Context, {} as Callback);

    expect(mockHandlerUserLimitCreated).toHaveBeenCalledWith(eventDataCreate.payload);
    expect(mockHandlerUserLimitCreated).toHaveBeenCalledTimes(RECORDS_COUNT);
    expect(mockHandlerUserLimitProgressChanged).toHaveBeenCalledWith(
      eventDataProcessChanged.payload
    );
    expect(mockHandlerUserLimitProgressChanged).toHaveBeenCalledTimes(RECORDS_COUNT);
    expect(mockHandlerUserLimitReset).toHaveBeenCalledTimes(1);
  });

  test('should handle invalid JSON gracefully', async () => {
    const mockEvent: KinesisStreamEvent = {
      Records: [createMockStreamEvent(eventTypes.USER_LIMIT_CREATED)],
    };
    mockEvent.Records[0].kinesis.data = 'invalid-json';

    const result = await handler(mockEvent, {} as Context, {} as Callback);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: 'mock-sequence-number' }],
    });
    expect(mockHandlerUserLimitCreated).not.toHaveBeenCalled();
    expect(mockHandlerUserLimitProgressChanged).not.toHaveBeenCalled();
    expect(mockHandlerUserLimitReset).not.toHaveBeenCalled();
  });

  test('should handle unknown event type gracefully', async () => {
    const mockEvent: KinesisStreamEvent = {
      Records: [createMockStreamEvent('UNKNOWN_EVENT')],
    };

    await handler(mockEvent, {} as Context, {} as Callback);

    expect(mockLogger.error).toHaveBeenCalledWith(
      'No handler registered for event type:',
      'UNKNOWN_EVENT'
    );
    expect(mockHandlerUserLimitCreated).not.toHaveBeenCalled();
    expect(mockHandlerUserLimitProgressChanged).not.toHaveBeenCalled();
    expect(mockHandlerUserLimitReset).not.toHaveBeenCalled();
  });

  test('should handle handler errors gracefully', async () => {
    const mockEvent: KinesisStreamEvent = {
      Records: [createMockStreamEvent(eventTypes.USER_LIMIT_CREATED)],
    };

    mockHandlerUserLimitCreated.mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    await handler(mockEvent, {} as Context, {} as Callback);

    expect(mockHandlerUserLimitCreated).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'There was an error while processing record:',
      'Test error'
    );
  });
});
