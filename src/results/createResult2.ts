import { Result, SyncErrorType } from './baseResult';
import { createError, createResultErrorFromException } from './errors';

const createSuccess = (): Result => {
    return { isSuccess: true };
};

export const result = {
    success: createSuccess,
    errorFromException: createResultErrorFromException,
    syncError: (message: string): Result => createError({ type: SyncErrorType.SyncFailed, message: message }),
    error: (type: SyncErrorType, message: string): Result => createError({ type, message }),
    notImplementedError: (message: string): Result =>
        createError({ type: SyncErrorType.NotImplemented, message: message })
};
