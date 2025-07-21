import { logger, storage } from '../common/common';
import { EventPayload, UserLimitResetPayload, UserLimitResetPayloadSchema } from '../types/events';

class UserLimitResetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserLimitResetError';
  }
}

export const handlerUserLimitReset = async (rawPayload: EventPayload) => {
  const payload: UserLimitResetPayload = UserLimitResetPayloadSchema.parse(rawPayload);

  if (!(await storage.has(payload.userId))) {
    throw new UserLimitResetError(
      `Failed to reset user limit progress. User limit does not exist for user id: ${payload.userId}`
    );
  }

  const userLimit = await storage.get(payload.userId);
  userLimit.progress = '0';

  await storage.set(payload.userId, userLimit);
  logger.info('[INFO] User limit reset:', payload.userId);
};
