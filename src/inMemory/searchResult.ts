//interface FailureType extends string{}

import { BaseError } from '@equinor/echo-base';
import { result, ResultValue, ResultValues, SearchModuleError, SyncErrorType } from '../baseResult';
import { OfflineSystem } from '../offlineSync/syncSettings';

function createFromError<T>(exception: Error | BaseError): ResultValues<T> {
    const errorResult = result.errorFromException(exception);
    return { isSuccess: false, values: [], error: errorResult.error };
}

function createSearchArraySuccessOrEmpty<T>(values: T[]): ResultValues<T> {
    return { isSuccess: true, values };
}

function createSearchSuccessOrNotFound<T>(value: T | undefined): ResultValue<T> {
    return { isSuccess: true, value, isNotFound: value === undefined };
}

function singleSearchErrorNotEnabled<T>(offlineSystem: OfflineSystem): ResultValue<T> {
    return {
        isSuccess: false,
        isNotFound: false,
        error: createSyncNotEnabled(offlineSystem)
    };
}

function searchErrorNotEnabled<T>(offlineSystem: OfflineSystem): ResultValues<T> {
    return {
        isSuccess: false,
        values: [],
        error: createSyncNotEnabled(offlineSystem)
    };
}

function createSyncNotEnabled(offlineSystem: OfflineSystem): SearchModuleError {
    return {
        type: SyncErrorType.SyncIsNotEnabled,
        message: `To search you first have to enable sync for ${offlineSystem}`
    };
}

export const searchResult = {
    successOrNotFound: createSearchSuccessOrNotFound,
    syncNotEnabledError: singleSearchErrorNotEnabled
};

export const searchResults = {
    error: createFromError,
    successOrEmpty: createSearchArraySuccessOrEmpty,
    syncNotEnabledError: searchErrorNotEnabled
};

//ErrorType worth considering
//type Failure = string;

// export interface Failure<FailureType extends string> {
//     type: FailureType;
//     reason: string;
// }
