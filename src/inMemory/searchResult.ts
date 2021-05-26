interface BaseResult {
    isSuccess: boolean;
}

//interface FailureType extends string{}

export interface SearchResults<T> extends BaseResult {
    errorType: SearchErrorType;
    data: T[];
}

//type Failure = string;

export interface SearchResult<T> extends BaseResult {
    data?: T;
}

// export interface Failure<FailureType extends string> {
//     type: FailureType;
//     reason: string;
// }

export enum ErrorType {}

export enum SearchErrorType {
    None = 'None',
    SyncDisabled = 'SyncDisabled'
}

export enum NetworkErrorType {
    None = 'None',
    SyncDisabled = 'SyncDisabled'
}

export function searchSuccess<T>(data: T[]): SearchResults<T> {
    return { isSuccess: true, data, errorType: SearchErrorType.None };
}

export function searchErrorNotEnabled<T>(): SearchResults<T> {
    return { isSuccess: false, data: [], errorType: SearchErrorType.SyncDisabled };
}
