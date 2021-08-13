import { BaseError, BaseErrorArgs } from '@equinor/echo-base';

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

export class SyncError extends BaseError {
    constructor(message: string, exception?: Error) {
        super({ message, exception: { ...exception } } as BaseErrorArgs); //TODO Ove Test if this works
    }
}

export class DbError extends SyncError {}

export class NotImplementedError extends SyncError {}
export class JsonParseError extends SyncError {}

export class ArgumentError extends SyncError {}
export class ArgumentDateError extends ArgumentError {}

export class SyncNotEnabledError extends SyncError {}

export class NotInitializedError extends SyncError {}

export class SyncCanceledError extends SyncError {
    constructor(message: string) {
        super(message);
        this.hasBeenLogged = true; //expected - should not be logged
    }
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

export interface SearchModuleError {
    type: SyncErrorType;
    name?: string;
    message?: string;
    stack?: string;
    httpStatusCode?: number;
    url?: string;
    properties?: Record<string, unknown>;
}
