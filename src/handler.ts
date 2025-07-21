import { KinesisStreamHandler } from 'aws-lambda';
import { EventData, EventPayload, EventType, eventTypes } from './types/events';
import { handlerUserLimitReset } from './handlers/userLimitReset';
import { handlerUserLimitCreated } from './handlers/userLimitCreated';
import { handlerUserLimitProgressChanged } from './handlers/userLimitProgressChanged';
import { logger } from './common/common';
import 'dotenv/config';

type EventHandlerFn = (payload: EventPayload) => Promise<void>;

export const handler: KinesisStreamHandler = async (event) => {
  const handlers: Record<EventType, EventHandlerFn> = {
    [eventTypes.USER_LIMIT_CREATED]: handlerUserLimitCreated,
    [eventTypes.USER_LIMIT_RESET]: handlerUserLimitReset,
    [eventTypes.USER_LIMIT_PROGRESS_CHANGED]: handlerUserLimitProgressChanged,
  };

  for (const record of event.Records) {
    const json = Buffer.from(record.kinesis.data, 'base64').toString('utf-8');

    let parsed: EventData;
    try {
      parsed = JSON.parse(json);
    } catch {
      logger.error('Invalid JSON:', json);

      if (process.env.RUN_MODE === 'local') {
        continue;
      }

      // Able to return single record since we're working with streams. Not required for local testing.
      return { batchItemFailures: [{ itemIdentifier: record.kinesis.sequenceNumber }] };
    }

    const { type, payload } = parsed;

    const handler = handlers[type];

    if (!handler) {
      logger.error('No handler registered for event type:', type);
      continue;
    }

    try {
      await handler(payload);
    } catch (error) {
      logger.error('There was an error while processing record:', (error as Error).message);

      if (process.env.RUN_MODE === 'local') {
        continue;
      }

      // Able to return single record since we're working with streams. Not required for local testing.
      return { batchItemFailures: [{ itemIdentifier: record.kinesis.sequenceNumber }] };
    }
  }

  return { batchItemFailures: [] };
};
