import { Logger } from '@aws-lambda-powertools/logger';
import { AbstractStorage, DynamoStorage, MapStorage } from '../types/storage';

export const logger = new Logger({
  logLevel: 'INFO',
  serviceName: 'custom-kinesis-handler-service',
});

// For demo purposes, we are using MapStorage
export const storage: AbstractStorage =
  process.env.ENABLE_DYNAMO_DB === 'true' ? new DynamoStorage() : new MapStorage();
