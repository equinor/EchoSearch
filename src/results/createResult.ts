import { BaseError } from '@equinor/echo-base';
import { OfflineSystem } from '../offlineSync/syncSettings';
import { Result, ResultArray, ResultValue, SyncErrorType } from './baseResult';
import { createError, createResultErrorFromException } from './errors';

const createSuccess = (): Result => {
    return { isSuccess: true };
};
function createSyncNotEnabledError(offlineSystem: OfflineSystem): Result {
    return result.error(SyncErrorType.SyncIsNotEnabled, `To search you first have to enable sync for ${offlineSystem}`);
}

class SingleValueResult {
    successOrNotFound<T>(value: T | undefined): ResultValue<T> {
        return { isSuccess: true, value, isNotFound: value === undefined };
    }
    syncNotEnabledError<T>(offlineSystem: OfflineSystem): ResultValue<T> {
        return { ...createSyncNotEnabledError(offlineSystem), isNotFound: false };
    }
}

class ArrayValueResults {
    error<T>(exception: Error | BaseError): ResultArray<T> {
        const errorResult = result.errorFromException(exception);
        return { isSuccess: false, values: [], error: errorResult.error };
    }

    successOrEmpty<T>(values: T[]): ResultArray<T> {
        return { isSuccess: true, values };
    }

    syncNotEnabledError<T>(offlineSystem: OfflineSystem): ResultArray<T> {
        return { ...createSyncNotEnabledError(offlineSystem), values: [] };
    }
}

export const result = {
    success: createSuccess,
    errorFromException: createResultErrorFromException,
    syncError: (message: string): Result => createError({ type: SyncErrorType.SyncFailed, message: message }),
    error: (type: SyncErrorType, message: string): Result => createError({ type, message }),
    notImplementedError: (message: string): Result =>
        createError({ type: SyncErrorType.NotImplemented, message: message })
};

export const resultValue = new SingleValueResult();

export const resultArray = new ArrayValueResults();

//ErrorType worth considering
//type Failure = string;

// export interface Failure<FailureType extends string> {
//     type: FailureType;
//     reason: string;
// }
//interface FailureType extends string{}
