import { logger, storage } from '../common/common';
import {
  EventPayload,
  UserLimitProgressChangedPayload,
  UserLimitProgressChangedPayloadSchema,
} from '../types/events';
import { UserLimit } from '../types/user-limit';

const validatePositiveNumber = (value: string, fieldName: string): number => {
  const numberValue = Number(value);
  if (isNaN(numberValue) || numberValue < 0) {
    throw new Error(`User Limit property < ${fieldName} > is not a positive number`);
  }

  return numberValue;
};

export const handlerUserLimitProgressChanged = (rawPayload: EventPayload) => {
  const payload: UserLimitProgressChangedPayload =
    UserLimitProgressChangedPayloadSchema.parse(rawPayload);

  if (!storage.has(payload.userId)) {
    throw new Error(
      `Failed to change user limit progress. User limit does not exist for user id: ${payload.userId}`
    );
  }

  const amount = validatePositiveNumber(payload.amount, 'amount');
  const previousProgress = validatePositiveNumber(payload.previousProgress, 'previousProgress');

  const userLimit = storage.get(payload.userId)! as UserLimit;
  userLimit.progress = (previousProgress + amount).toString();

  storage.set(payload.userId, userLimit);
  logger.info(
    `[INFO] User limit progress changed: ${payload.userId} New progress: ${userLimit.progress}`
  );
};
