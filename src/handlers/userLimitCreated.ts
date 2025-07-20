import { logger, storage } from '../common/common';
import {
  EventPayload,
  UserLimitCreatedPayload,
  UserLimitCreatedPayloadSchema,
} from '../types/events';
import { UserLimit } from '../types/user-limit';

export const handlerUserLimitCreated = (rawPayload: EventPayload) => {
  const payload: UserLimitCreatedPayload = UserLimitCreatedPayloadSchema.parse(rawPayload);

  if (storage.has(payload.userId)) {
    throw new Error(
      `Failed to create user limit. User limit already exists for user id: ${payload.userId}`
    );
  }

  storage.set(payload.userId, {
    ...payload,
  } as UserLimit);
  logger.info('[INFO] User limit created:', payload.userId);
};
