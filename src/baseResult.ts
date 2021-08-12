import {
    BaseError,
    BaseErrorArgs,
    ErrorProperties,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError
} from '@equinor/echo-base';

export interface Result {
    readonly isSuccess: boolean;
    readonly error?: SearchModuleError; //TODO Ove, convert to error enum type?
}

export interface ResultValue<T> extends Result {
    readonly isSuccess: boolean;
    readonly value?: T;
    readonly error?: SearchModuleError; //TODO Ove, convert to error enum type?
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

const createSuccess = (): Result => {
    return { isSuccess: true };
};

function createValueSuccess<T>(value: T): ResultValue<T> {
    return { isSuccess: true, value };
}

const createError = (error: SearchModuleError): Result => {
    return { isSuccess: false, error };
};

function createResultErrorFromException<T extends Result>(error: Error | BaseError): T {
    let errorType = SyncErrorType.Unknown;

    if (error instanceof SyncCanceledError) errorType = SyncErrorType.SyncCanceled;
    else if (error instanceof NotFoundError) errorType = SyncErrorType.NotFound;
    else if (error instanceof ForbiddenError || error instanceof UnauthorizedError) errorType = SyncErrorType.Forbidden;
    else if (error instanceof NotInitializedError) errorType = SyncErrorType.NotInitialized;
    else if (error instanceof ArgumentError) errorType = SyncErrorType.BugInCode;
    else if (error instanceof Error && error.message.toLowerCase().includes('abort'))
        errorType = SyncErrorType.SyncCanceled; //fetch url call was aborted

    let allProperties: ErrorProperties = {};
    if (error instanceof BaseError) {
        allProperties = error.getProperties(); //TODO unit test, are we missing any custom properties?
    } else if (error instanceof Error) {
        allProperties = JSON.parse(JSON.stringify(error)); //TODO unit test how this iw working //TODO might not work with dexieError - circular dependency
    } //TODO handled unknown types as string

    const searchModuleError: SearchModuleError = {
        type: errorType,
        name: error.name,
        message: error.message,
        stack: error.stack,
        httpStatusCode: allProperties?.httpStatusCode as number,
        url: allProperties?.url as string,
        properties: { ...allProperties }
    };

    return createError(searchModuleError) as T;
}

export const result = {
    success: createSuccess,
    valueSuccess: createValueSuccess,
    errorFromException: createResultErrorFromException,
    syncError: (message: string): Result => createError({ type: SyncErrorType.SyncFailed, message: message }),
    notImplementedError: (message: string): Result =>
        createError({ type: SyncErrorType.NotImplemented, message: message })
};

//TODO
//some errors we only want to log?
//some we want to display to the user
//some we want to display to the user only in certain situations

export enum SyncErrorType {
    Unknown = 'Unknown',
    NotFound = 'ApiNotFound',
    Forbidden = 'ApiForbidden',
    //Api other Error
    SyncFailed = 'SyncFailed',
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
