import { Logger } from '@aws-lambda-powertools/logger';
import { AbstractStorage, MapStorage } from '../types/storage';

export const logger = new Logger({
  logLevel: 'INFO',
  serviceName: 'custom-kinesis-handler-service',
});

export const storage: AbstractStorage = new MapStorage();
