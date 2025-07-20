import { logger, storage } from '../common/common';
import { EventPayload, UserLimitResetPayload, UserLimitResetPayloadSchema } from '../types/events';
import { UserLimit } from '../types/user-limit';

export const handlerUserLimitReset = (rawPayload: EventPayload) => {
  const payload: UserLimitResetPayload = UserLimitResetPayloadSchema.parse(rawPayload);

  if (!storage.has(payload.userId)) {
    throw new Error(
      `Failed to reset user limit progress. User limit does not exist for user id: ${payload.userId}`
    );
  }

  const userLimit = storage.get(payload.userId)! as UserLimit;
  userLimit.progress = '0';

  storage.set(payload.userId, userLimit);
  logger.info('[INFO] User limit reset:', payload.userId);
};
