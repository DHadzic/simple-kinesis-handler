import { logger, storage } from '../common/common';
import { EventPayload, UserLimitProgressChangedPayload } from '../types/events';
import { UserLimit } from '../types/user-limit';

export const handlerUserLimitProgressChanged = (payload: EventPayload) => {
  if (!storage.has(payload.userId)) {
    logger.error(
      'Failed to change user limit progress. User limit does not exist for user id:',
      payload.userId
    );
    return;
  }

  const userLimitProgressChangedPayload = payload as UserLimitProgressChangedPayload;

  const userLimit = storage.get(payload.userId)! as UserLimit;
  userLimit.progress = userLimitProgressChangedPayload.remainingAmount;

  // Redundant for current Map implementation
  storage.set(payload.userId, userLimit);
  logger.info(
    `[INFO] User limit progress changed: ${payload.userId} New progress: ${userLimit.progress}`
  );
};
