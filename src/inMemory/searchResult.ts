//interface FailureType extends string{}

import { BaseError } from '@equinor/echo-base';
import { ErrorType, result, Result } from '../baseResult';
import { OfflineSystem } from '../offlineSync/syncSettings';

export interface SearchResults<T> extends Result {
    data: T[];
}

export interface SearchResult<T> extends Result {
    data?: T;
    isNotFound: boolean;
}

function createFromError<T>(exception: Error | BaseError): SearchResults<T> {
    const errorResult = result.errorFromException(exception);
    return { isSuccess: false, data: [], error: errorResult.error };
}

function createSearchArraySuccessOrEmpty<T>(data: T[]): SearchResults<T> {
    return { isSuccess: true, data };
}

function createSearchSuccessOrNotFound<T>(data: T | undefined): SearchResult<T> {
    return { isSuccess: true, data: data, isNotFound: data === undefined };
}

function searchErrorNotEnabled<T>(offlineSystem: OfflineSystem): SearchResults<T> {
    return {
        isSuccess: false,
        data: [],
        error: {
            type: ErrorType.SyncIsNotEnabled,
            message: `To search you first have to enable sync for ${offlineSystem}`
        }
    };
}

export const searchResult = {
    successOrNotFound: createSearchSuccessOrNotFound
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
