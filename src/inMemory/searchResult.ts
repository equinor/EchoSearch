//interface FailureType extends string{}

import { BaseError } from '@equinor/echo-base';
import { ErrorType, result, Result } from '../baseResult';
import { OfflineSystem } from '../offlineSync/syncSettings';

export interface SearchResults<T> extends Result {
    values: T[];
}

export interface SearchResult<T> extends Result {
    value?: T;
    isNotFound: boolean;
}

function createFromError<T>(exception: Error | BaseError): SearchResults<T> {
    const errorResult = result.errorFromException(exception);
    return { isSuccess: false, values: [], error: errorResult.error };
}

function createSearchArraySuccessOrEmpty<T>(values: T[]): SearchResults<T> {
    return { isSuccess: true, values };
}

function createSearchSuccessOrNotFound<T>(value: T | undefined): SearchResult<T> {
    return { isSuccess: true, value, isNotFound: value === undefined };
}

function searchErrorNotEnabled<T>(offlineSystem: OfflineSystem): SearchResults<T> {
    return {
        isSuccess: false,
        values: [],
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
