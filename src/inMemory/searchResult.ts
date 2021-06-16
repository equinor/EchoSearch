//interface FailureType extends string{}

import { ErrorType, Result } from '../baseResult';
import { OfflineSystem } from '../offlineSync/syncSettings';

export interface SearchResults<T> extends Result {
    data: T[];
}

export interface SearchResult<T> extends Result {
    data?: T;
    isNotFound: boolean;
}

export function createSearchSuccessesOrEmpty<T>(data: T[]): SearchResults<T> {
    return { isSuccess: true, data };
}

export function createSearchSuccessOrNotFound<T>(data: T | undefined): SearchResult<T> {
    return { isSuccess: true, data: data, isNotFound: data === undefined };
}

export function searchErrorNotEnabled<T>(offlineSystem: OfflineSystem): SearchResults<T> {
    return {
        isSuccess: false,
        data: [],
        error: {
            type: ErrorType.SyncIsNotEnabled,
            message: `To search you first have to enable sync for ${offlineSystem}`
        }
    };
}

//ErrorType worth considering
//type Failure = string;

// export interface Failure<FailureType extends string> {
//     type: FailureType;
//     reason: string;
// }
