import { LimitPeriod, LimitStatus, LimitType } from './user-limit';
import { z } from 'zod';

export enum eventTypes {
  USER_LIMIT_CREATED = 'USER_LIMIT_CREATED',
  USER_LIMIT_PROGRESS_CHANGED = 'USER_LIMIT_PROGRESS_CHANGED',
  USER_LIMIT_RESET = 'USER_LIMIT_RESET',
}

export type EventType = `${eventTypes}`;

export const EventPayloadSchema = z.object({
  brandId: z.string(),
  userId: z.string(),
});
export type EventPayload = z.infer<typeof EventPayloadSchema>;

export const UserLimitCreatedPayloadSchema = EventPayloadSchema.extend({
  activeFrom: z.number(),
  period: z.enum(LimitPeriod),
  status: z.enum(LimitStatus),
  type: z.enum(LimitType),
  value: z.string(),
  currencyCode: z.string(),
  nextResetTime: z.number(),
  userLimitId: z.string(),
});

export type UserLimitCreatedPayload = z.infer<typeof UserLimitCreatedPayloadSchema>;

export const UserLimitProgressChangedPayloadSchema = EventPayloadSchema.extend({
  amount: z.string(),
  previousProgress: z.string(),
  remainingAmount: z.string(),
  currencyCode: z.string(),
  nextResetTime: z.number(),
  userLimitId: z.string(),
});
export type UserLimitProgressChangedPayload = z.infer<typeof UserLimitProgressChangedPayloadSchema>;

export const UserLimitResetPayloadSchema = EventPayloadSchema.extend({
  period: z.enum(LimitPeriod),
  resetAmount: z.string(),
  resetPercentage: z.string(),
  type: z.enum(LimitType),
  unusedAmount: z.string(),
  currencyCode: z.string(),
  nextResetTime: z.number(),
  userLimitId: z.string(),
});
export type UserLimitResetPayload = z.infer<typeof UserLimitResetPayloadSchema>;

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
