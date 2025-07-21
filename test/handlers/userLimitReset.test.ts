import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { handlerUserLimitReset } from '../../src/handlers/userLimitReset';
import * as common from '../../src/common/common';
import { mockUserLimit, mockUserLimitResetPayload } from '../__mocks__/events';
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

describe('handlerUserLimitReset', () => {
  const mockStorage = common.storage as jest.Mocked<typeof common.storage>;
  const mockLogger = common.logger as jest.Mocked<typeof common.logger>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should reset user limit progress', async () => {
    const RESET_PROGRESS_VALUE = '0';

    mockStorage.has.mockReturnValue(true);
    mockStorage.get.mockReturnValue(mockUserLimit);

    await handlerUserLimitReset(mockUserLimitResetPayload);

    expect(mockStorage.has).toHaveBeenCalledWith(mockUserLimitResetPayload.userId);
    expect(mockStorage.get).toHaveBeenCalledWith(mockUserLimitResetPayload.userId);
    expect(mockStorage.set).toHaveBeenCalledWith(
      mockUserLimitResetPayload.userId,
      expect.objectContaining({
        progress: RESET_PROGRESS_VALUE,
      })
    );
    expect(mockLogger.info).toHaveBeenCalled();
  });

  test('should throw error if user limit does not exist', async () => {
    mockStorage.has.mockReturnValue(false);

    await expect(handlerUserLimitReset(mockUserLimitResetPayload)).rejects.toThrow(
      `Failed to reset user limit progress. User limit does not exist for user id: ${mockUserLimitResetPayload.userId}`
    );
    expect(mockStorage.has).toHaveBeenCalledWith(mockUserLimitResetPayload.userId);
    expect(mockStorage.get).not.toHaveBeenCalled();
    expect(mockStorage.set).not.toHaveBeenCalled();
  });

  test('should throw error if payload validation fails', async () => {
    const VALIDATION_INPUT_LABEL = 'Invalid input';
    const VALIDATION_OPTION_LABEL = 'Invalid option';
    const TOTAL_FIELDS = 10;
    let validationFails = 0;

    try {
      await handlerUserLimitReset({} as unknown as EventPayload);
    } catch (err) {
      validationFails = (err as Error).message.split(VALIDATION_INPUT_LABEL).length - 1;
      validationFails += (err as Error).message.split(VALIDATION_OPTION_LABEL).length - 1;
    }

    expect(validationFails).toBe(TOTAL_FIELDS);
    expect(mockStorage.has).not.toHaveBeenCalled();
    expect(mockStorage.set).not.toHaveBeenCalled();
  });

  test('should throw error if payload validation fails', async () => {
    const VALIDATION_INPUT_LABEL = 'Invalid input';
    const VALIDATION_OPTION_LABEL = 'Invalid option';
    const TOTAL_FIELDS = 10;
    let validationFails = 0;

    try {
      await handlerUserLimitReset({} as unknown as EventPayload);
    } catch (err) {
      validationFails = (err as Error).message.split(VALIDATION_INPUT_LABEL).length - 1;
      validationFails += (err as Error).message.split(VALIDATION_OPTION_LABEL).length - 1;
    }

    expect(validationFails).toBe(TOTAL_FIELDS);
    expect(mockStorage.has).not.toHaveBeenCalled();
    expect(mockStorage.set).not.toHaveBeenCalled();
  });
});
