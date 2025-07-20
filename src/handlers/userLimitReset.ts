import { logger, storage } from '../common/common';
import { EventPayload } from '../types/events';
import { UserLimit } from '../types/user-limit';

export const handlerUserLimitReset = (payload: EventPayload) => {
  if (!storage.has(payload.userId)) {
    logger.error(
      'Failed to reset user limit progress. User limit does not exist for user id:',
      payload.userId
    );
    return;
  }

  const userLimit = storage.get(payload.userId)! as UserLimit;
  userLimit.progress = '0';

  // Redundant for current Map implementation
  storage.set(payload.userId, userLimit);
  logger.info('[INFO] User limit reset:', payload.userId);
};
