import { BaseError, BaseErrorArgs, NotFoundError } from '@equinor/echo-base';

export interface Result {
    readonly isSuccess: boolean;
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

export class ArgumentDateError extends SyncError {}

export class SyncNotEnabledError extends SyncError {}

export class SyncCanceledError extends SyncError {
    constructor(message: string) {
        super(message);
        this.hasBeenLogged = true; //expected - should not be logged
    }
}

const createSuccess = (): Result => {
    return { isSuccess: true };
};

const createError = (error: SearchModuleError): Result => {
    return { isSuccess: false, error };
};

function createResultErrorFromException(error: Error | BaseError): Result {
    let errorType = ErrorType.Unknown;

    if (error instanceof SyncCanceledError) errorType = ErrorType.SyncCanceled;
    else if (error instanceof NotFoundError) errorType = ErrorType.ApiNotFound;
    else if (error instanceof Error && error.message.toLowerCase().includes('abort'))
        errorType = ErrorType.SyncCanceled; //fetch url call was aborted

    let allProperties = {};
    if (error instanceof BaseError) {
        allProperties = error.getProperties(); //TODO unit test, are we missing any custom properties?
    } else if (error instanceof Error) {
        allProperties = JSON.parse(JSON.stringify(error)); //TODO unit test how this iw working
    } //TODO handled unknown types as string

    const searchModuleError: SearchModuleError = {
        type: errorType,
        message: error.message,
        name: error.name,
        stack: error.stack,
        properties: { ...allProperties }
    };
    //todo url and statusCode?
    return createError(searchModuleError);
}

export const result = {
    success: createSuccess,
    errorFromException: createResultErrorFromException,
    syncError: (message: string): Result => createError({ type: ErrorType.SyncFailed, message: message }),
    notImplementedError: (message: string): Result => createError({ type: ErrorType.NotImplemented, message: message })
};

// enum ErrorType {
//     SyncIsNotEnabled,
//     NetworkErrorForbidden,
//     NetworkErrorInternalServerError,
//     NetworkErrorBadRequest
// }

export enum ErrorType {
    Unknown = 'Unknown',
    ApiNotFound = 'ApiNotFound',
    ApiForbidden = 'ApiForbidden',
    NotImplemented = 'NotImplemented',
    SyncFailed = 'SyncFailed',
    SyncCanceled = 'SyncCanceled',
    SyncIsNotEnabled = 'SyncIsNotEnabled'
}

export interface SearchModuleError {
    type: ErrorType;
    name?: string;
    message?: string;
    stack?: string;
    httpStatusCode?: number;
    url?: string;
    properties?: Record<string, unknown>;
}
