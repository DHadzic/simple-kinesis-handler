import { LimitPeriod, LimitStatus, LimitType } from './user-limit';

export enum eventTypes {
  USER_LIMIT_CREATED = 'USER_LIMIT_CREATED',
  USER_LIMIT_PROGRESS_CHANGED = 'USER_LIMIT_PROGRESS_CHANGED',
  USER_LIMIT_RESET = 'USER_LIMIT_RESET',
}

export type EventType = `${eventTypes}`;

export interface EventPayload {
  brandId: string;
  currencyCode: string;
  nextResetTime: number;
  userId: string;
  userLimitId: string;
}

export interface UserLimitCreatedPayload extends EventPayload {
  activeFrom: number;
  period: LimitPeriod;
  status: LimitStatus;
  type: LimitType;
  value: string;
}

export interface UserLimitProgressChangedPayload extends EventPayload {
  amount: string;
  previousProgress: string;
  remainingAmount: string;
}

export interface UserLimitResetPayload extends EventPayload {
  period: LimitPeriod;
  resetAmount: string;
  resetPercentage: string;
  type: LimitType;
  unusedAmount: string;
}

export interface EventData {
  aggregateId: string;
  context: Record<string, unknown>;
  createdAt: number;
  eventId: string;
  payload: EventPayload;
  sequenceNumber: number;
  source: string;
  type: EventType;
}
