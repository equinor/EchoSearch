interface BaseResult {
    isSuccess: boolean;
}

export interface SearchResults<T> extends BaseResult {
    errorType: SearchErrorType;
    data: T[];
}

export interface SearchResult<T> extends BaseResult {
    data?: T;
}

export enum SearchErrorType {
    None = 'None',
    SyncNotEnabled = 'SyncNotEnabled'
}

export function searchSuccess<T>(data: T[]): SearchResults<T> {
    return { isSuccess: true, data, errorType: SearchErrorType.None };
}

export function searchErrorNotEnabled<T>(): SearchResults<T> {
    return { isSuccess: false, data: [], errorType: SearchErrorType.SyncNotEnabled };
}
