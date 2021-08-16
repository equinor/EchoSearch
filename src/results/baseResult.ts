export interface Result {
    readonly isSuccess: boolean;
    readonly error?: SearchModuleError; //TODO Ove, convert to error enum type?
}

export interface ResultValue<T> extends Result {
    readonly value?: T;
    isNotFound: boolean;
}

export interface ResultValues<T> extends Result {
    readonly values: T[];
}

export interface InternalSyncResult extends Result {
    newestItemDate?: Date;
    itemsSyncedCount: number;
}

export interface SearchModuleError {
    type: SyncErrorType;
    name?: string;
    message?: string;
    stack?: string;
    httpStatusCode?: number;
    url?: string;
    properties?: Record<string, unknown>;
}

export enum SyncErrorType {
    Unknown = 'Unknown',
    NotFound = 'ApiNotFound',
    Forbidden = 'ApiForbidden',
    //Api other Error
    SyncFailed = 'SyncFailed', //SyncIsNotEnabled
    SyncCanceled = 'SyncCanceled',
    SyncIsNotEnabled = 'SyncIsNotEnabled',
    NotInitialized = 'NotInitialized',
    BugInCode = 'BugInCode',
    NotImplemented = 'NotImplemented'
    //InMemoryDataNotReady - waiting for sync
    //Search Not ready
    //Search Not Initialized
}

/* possible errors   

    ApiError
        Forbidden
        Other
        NotFound
    
    NotInitialized

    SyncError
        SyncIsNotEnabled
        Dexie
    
    SearchError
        NotFound?

    Canceled

    NotImplemented
    BugInCode

*/

//TODO
//some errors we only want to log?
//some we want to display to the user
//some we want to display to the user only in certain situations
