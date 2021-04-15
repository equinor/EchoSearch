export interface SearchResult<T> {
    isSuccess: boolean;

    errorType: SearchErrorType;
    data: T[];
}

export enum SearchErrorType {
    None = 'None',
    SyncNotEnabled = 'SyncNotEnabled'
}

export function searchSuccess<T>(data: T[]): SearchResult<T> {
    return { isSuccess: true, data, errorType: SearchErrorType.None };
}

export function searchErrorNotEnabled<T>(): SearchResult<T> {
    return { isSuccess: false, data: [], errorType: SearchErrorType.SyncNotEnabled };
}
