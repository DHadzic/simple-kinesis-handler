import { logger, storage } from '../common/common';
import {
  EventPayload,
  UserLimitCreatedPayload,
  UserLimitCreatedPayloadSchema,
} from '../types/events';

class UserLimitCreatedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserLimitCreatedError';
  }
}

export const handlerUserLimitCreated = async (rawPayload: EventPayload) => {
  const payload: UserLimitCreatedPayload = UserLimitCreatedPayloadSchema.parse(rawPayload);

  if (await storage.has(payload.userId)) {
    throw new UserLimitCreatedError(
      `Failed to create user limit. User limit already exists for user id: ${payload.userId}`
    );
  }

  await storage.set(payload.userId, payload);
  logger.info('[INFO] User limit created:', payload.userId);
};
