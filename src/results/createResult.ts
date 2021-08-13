//interface FailureType extends string{}

import { BaseError } from '@equinor/echo-base';
import { OfflineSystem } from '../offlineSync/syncSettings';
import { Result, ResultValue, ResultValues, SyncErrorType } from './baseResult';
import { result } from './createResult2';

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
    error<T>(exception: Error | BaseError): ResultValues<T> {
        const errorResult = result.errorFromException(exception);
        return { isSuccess: false, values: [], error: errorResult.error };
    }

    successOrEmpty<T>(values: T[]): ResultValues<T> {
        return { isSuccess: true, values };
    }

    syncNotEnabledError<T>(offlineSystem: OfflineSystem): ResultValues<T> {
        return { ...createSyncNotEnabledError(offlineSystem), values: [] };
    }
}

export const createResult = new SingleValueResult();

export const createResults = new ArrayValueResults();

//ErrorType worth considering
//type Failure = string;

// export interface Failure<FailureType extends string> {
//     type: FailureType;
//     reason: string;
// }
