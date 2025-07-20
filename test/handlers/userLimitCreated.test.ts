import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { handlerUserLimitCreated } from '../../src/handlers/userLimitCreated';
import * as common from '../../src/common/common';
import { EventPayload } from '../../src/types/events';
import { mockUserLimitCreatedPayload } from '../__mocks__/events';

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

describe('handlerUserLimitCreated', () => {
  const mockStorage = common.storage as jest.Mocked<typeof common.storage>;
  const mockLogger = common.logger as jest.Mocked<typeof common.logger>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should successfully create a user limit', () => {
    mockStorage.has.mockReturnValue(false);

    handlerUserLimitCreated(mockUserLimitCreatedPayload);

    expect(mockStorage.has).toHaveBeenCalledWith(mockUserLimitCreatedPayload.userId);
    expect(mockStorage.set).toHaveBeenCalledWith(
      mockUserLimitCreatedPayload.userId,
      expect.objectContaining({
        userId: mockUserLimitCreatedPayload.userId,
        userLimitId: mockUserLimitCreatedPayload.userLimitId,
      })
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[INFO] User limit created:',
      mockUserLimitCreatedPayload.userId
    );
  });

  test('should throw error if user limit already exists', () => {
    mockStorage.has.mockReturnValue(true);

    expect(() => handlerUserLimitCreated(mockUserLimitCreatedPayload)).toThrow(
      `Failed to create user limit. User limit already exists for user id: ${mockUserLimitCreatedPayload.userId}`
    );
    expect(mockStorage.has).toHaveBeenCalledWith(mockUserLimitCreatedPayload.userId);
    expect(mockStorage.set).not.toHaveBeenCalled();
  });

  test('should throw error if payload validation fails', () => {
    const VALIDATION_INPUT_LABEL = 'Invalid input';
    const VALIDATION_OPTION_LABEL = 'Invalid option';
    const TOTAL_FIELDS = 10;
    let validationFails = 0;

    try {
      handlerUserLimitCreated({} as unknown as EventPayload);
    } catch (err) {
      validationFails = (err as Error).message.split(VALIDATION_INPUT_LABEL).length - 1;
      validationFails += (err as Error).message.split(VALIDATION_OPTION_LABEL).length - 1;
    }

    expect(validationFails).toBe(TOTAL_FIELDS);
    expect(mockStorage.has).not.toHaveBeenCalled();
    expect(mockStorage.set).not.toHaveBeenCalled();
  });
});
