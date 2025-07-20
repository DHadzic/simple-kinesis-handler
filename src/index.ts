import { readFileSync } from 'fs';
import { join } from 'path';
import { EventData } from './types/events';
import { handler } from './handler';
import { Callback, Context, KinesisStreamEvent, KinesisStreamRecord } from 'aws-lambda';

const filePath = join(__dirname, 'data', 'events.json');
const jsonData = readFileSync(filePath, 'utf-8');

const events: EventData[] = JSON.parse(jsonData.trim());

const mockKinesisStreamRecord: KinesisStreamRecord = {
  kinesis: {
    data: 'mock-data',
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
};

const mockEvent: KinesisStreamEvent = {
  Records: events.map<KinesisStreamRecord>((event) => {
    const mockObjCopy = JSON.parse(JSON.stringify(mockKinesisStreamRecord)) as KinesisStreamRecord;
    const encodedData = Buffer.from(JSON.stringify(event)).toString('base64');
    mockObjCopy.kinesis.data = encodedData;

    return mockObjCopy;
  }),
};

handler(mockEvent, {} as Context, {} as Callback);
