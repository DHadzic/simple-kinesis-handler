import {
  UserLimitCreatedPayload,
  UserLimitProgressChangedPayload,
  UserLimitResetPayload,
} from '../../src/types/events';
import { LimitPeriod, LimitStatus, LimitType, UserLimit } from '../../src/types/user-limit';

export const mockUserLimitCreatedPayload: UserLimitCreatedPayload = {
  brandId: 'mock-brand-id',
  currencyCode: 'mock-currency-code',
  nextResetTime: Date.now(),
  userId: 'mock-user-id',
  userLimitId: 'mock-user-limit-id',
  activeFrom: Date.now(),
  period: LimitPeriod.DAY,
  status: LimitStatus.ACTIVE,
  value: 'mock-value',
  type: LimitType.DEPOSIT,
};

export const mockUserLimitProgressChangedPayload: UserLimitProgressChangedPayload = {
  brandId: 'mock-brand-id',
  currencyCode: 'mock-currency-code',
  nextResetTime: Date.now(),
  userId: 'mock-user-id',
  userLimitId: 'mock-user-limit-id',
  amount: '100',
  previousProgress: '500',
  remainingAmount: '400',
};

export const mockUserLimitResetPayload: UserLimitResetPayload = {
  brandId: 'mock-brand-id',
  currencyCode: 'mock-currency-code',
  nextResetTime: Date.now(),
  userId: 'mock-user-id',
  userLimitId: 'mock-user-limit-id',
  period: LimitPeriod.DAY,
  resetAmount: 'mock-reset-amount',
  resetPercentage: 'mock-reset-percentage',
  type: LimitType.DEPOSIT,
  unusedAmount: 'mock-unused-amount',
};

export const mockUserLimit: UserLimit = {
  userId: 'mock-user-id',
  userLimitId: 'mock-user-limit-id',
  brandId: 'mock-brand-id',
  currencyCode: 'mock-currency-code',
  value: 'mock-value',
  progress: 'mock-progress',
  period: LimitPeriod.DAY,
  status: LimitStatus.ACTIVE,
  activeFrom: Date.now(),
  type: LimitType.DEPOSIT,
};
