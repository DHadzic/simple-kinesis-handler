import { logger, storage } from '../common/common';
import { EventPayload } from '../types/events';
import { UserLimit } from '../types/user-limit';

export const handlerUserLimitCreated = (payload: EventPayload) => {
  if (storage.has(payload.userId)) {
    logger.error(
      'Failed to create user limit. User limit already exists for user id:',
      payload.userId
    );
    return;
  }

  storage.set(payload.userId, {
    ...payload,
  } as UserLimit);

  logger.info('[INFO] User limit created:', payload.userId);
};
