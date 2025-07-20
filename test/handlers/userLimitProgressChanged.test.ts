import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { handlerUserLimitProgressChanged } from '../../src/handlers/userLimitProgressChanged';
import * as common from '../../src/common/common';
import { mockUserLimit, mockUserLimitProgressChangedPayload } from '../__mocks__/events';
import { EventPayload } from '../../src/types/events';

jest.mock('../../src/common/common', () => {
  return {
    logger: {
      info: jest.fn(),
      error: jest.fn(),
    },
    storage: {
      has: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    },
  };
});

describe('handlerUserLimitProgressChanged', () => {
  const mockStorage = common.storage as jest.Mocked<typeof common.storage>;
  const mockLogger = common.logger as jest.Mocked<typeof common.logger>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should update user limit progress', () => {
    mockStorage.has.mockReturnValue(true);
    mockStorage.get.mockReturnValue(mockUserLimit);

    handlerUserLimitProgressChanged(mockUserLimitProgressChangedPayload);

    expect(mockStorage.has).toHaveBeenCalledWith(mockUserLimitProgressChangedPayload.userId);
    expect(mockStorage.get).toHaveBeenCalledWith(mockUserLimitProgressChangedPayload.userId);
    expect(mockStorage.set).toHaveBeenCalledWith(
      mockUserLimitProgressChangedPayload.userId,
      expect.objectContaining({
        progress: '600',
      })
    );
    expect(mockLogger.info).toHaveBeenCalled();
  });

  test('should throw error if user limit does not exist', () => {
    mockStorage.has.mockReturnValue(false);

    expect(() => handlerUserLimitProgressChanged(mockUserLimitProgressChangedPayload)).toThrow(
      `Failed to change user limit progress. User limit does not exist for user id: ${mockUserLimitProgressChangedPayload.userId}`
    );
    expect(mockStorage.has).toHaveBeenCalledWith(mockUserLimitProgressChangedPayload.userId);
    expect(mockStorage.get).not.toHaveBeenCalled();
    expect(mockStorage.set).not.toHaveBeenCalled();
  });

  test('should throw error if amount is a non-number', () => {
    mockStorage.has.mockReturnValue(true);
    mockStorage.get.mockReturnValue(mockUserLimit);

    const invalidPayload = {
      ...mockUserLimitProgressChangedPayload,
      amount: 'invalid',
    };

    expect(() => handlerUserLimitProgressChanged(invalidPayload)).toThrow(
      'User Limit property < amount > is not a positive number'
    );
    expect(mockStorage.has).toHaveBeenCalledWith(mockUserLimitProgressChangedPayload.userId);
    expect(mockStorage.get).not.toHaveBeenCalled();
    expect(mockStorage.set).not.toHaveBeenCalled();
  });

  test('should throw error if amount is a  negative number', () => {
    mockStorage.has.mockReturnValue(true);
    mockStorage.get.mockReturnValue(mockUserLimit);

    const invalidPayload = {
      ...mockUserLimitProgressChangedPayload,
      amount: '-100',
    };

    expect(() => handlerUserLimitProgressChanged(invalidPayload)).toThrow(
      'User Limit property < amount > is not a positive number'
    );
    expect(mockStorage.has).toHaveBeenCalledWith(mockUserLimitProgressChangedPayload.userId);
    expect(mockStorage.get).not.toHaveBeenCalled();
    expect(mockStorage.set).not.toHaveBeenCalled();
  });

  test('should throw error if previousProgress is a non-number', () => {
    mockStorage.has.mockReturnValue(true);
    mockStorage.get.mockReturnValue(mockUserLimit);

    const invalidPayload = {
      ...mockUserLimitProgressChangedPayload,
      previousProgress: 'invalid',
    };

    expect(() => handlerUserLimitProgressChanged(invalidPayload)).toThrow(
      'User Limit property < previousProgress > is not a positive number'
    );
    expect(mockStorage.has).toHaveBeenCalledWith(mockUserLimitProgressChangedPayload.userId);
    expect(mockStorage.get).not.toHaveBeenCalled();
    expect(mockStorage.set).not.toHaveBeenCalled();
  });

  test('should throw error if previousProgress is a negative number', () => {
    mockStorage.has.mockReturnValue(true);
    mockStorage.get.mockReturnValue(mockUserLimit);

    const invalidPayload = {
      ...mockUserLimitProgressChangedPayload,
      previousProgress: '-100',
    };

    expect(() => handlerUserLimitProgressChanged(invalidPayload)).toThrow(
      'User Limit property < previousProgress > is not a positive number'
    );
    expect(mockStorage.has).toHaveBeenCalledWith(mockUserLimitProgressChangedPayload.userId);
    expect(mockStorage.get).not.toHaveBeenCalled();
    expect(mockStorage.set).not.toHaveBeenCalled();
  });

  test('should throw error if payload validation fails', () => {
    const VALIDATION_INPUT_LABEL = 'Invalid input';
    const TOTAL_FIELDS = 8;
    let validationFails = 0;

    try {
      handlerUserLimitProgressChanged({} as unknown as EventPayload);
    } catch (err) {
      validationFails = (err as Error).message.split(VALIDATION_INPUT_LABEL).length - 1;
    }

    expect(validationFails).toBe(TOTAL_FIELDS);
    expect(mockStorage.has).not.toHaveBeenCalled();
    expect(mockStorage.set).not.toHaveBeenCalled();
  });
});
