import { logger, storage } from '../common/common';
import {
  EventPayload,
  UserLimitProgressChangedPayload,
  UserLimitProgressChangedPayloadSchema,
} from '../types/events';

class UserLimitProgressChangedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserLimitProgressChangedError';
  }
}

const validatePositiveNumber = (value: string, fieldName: string): number => {
  const numberValue = Number(value);
  if (isNaN(numberValue) || numberValue < 0) {
    throw new UserLimitProgressChangedError(
      `User Limit property < ${fieldName} > is not a positive number`
    );
  }

  return numberValue;
};

export const handlerUserLimitProgressChanged = async (rawPayload: EventPayload) => {
  const payload: UserLimitProgressChangedPayload =
    UserLimitProgressChangedPayloadSchema.parse(rawPayload);

  if (!(await storage.has(payload.userId))) {
    throw new UserLimitProgressChangedError(
      `Failed to change user limit progress. User limit does not exist for user id: ${payload.userId}`
    );
  }

  const amount = validatePositiveNumber(payload.amount, 'amount');
  const previousProgress = validatePositiveNumber(payload.previousProgress, 'previousProgress');

  const userLimit = await storage.get(payload.userId);
  userLimit.progress = (previousProgress + amount).toString();

  await storage.set(payload.userId, userLimit);
  logger.info(
    `[INFO] User limit progress changed: ${payload.userId} New progress: ${userLimit.progress}`
  );
};
