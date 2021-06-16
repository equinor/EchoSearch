import { BaseError, BaseErrorArgs } from '@equinor/echo-base';

export interface Result {
    readonly isSuccess: boolean;
    readonly error?: SearchModuleError; //TODO Ove, convert to error enum type?
}

// export class SearchModuleError extends BaseError {
//     constructor(message: string, exception?: Error) {
//         super({ message, exception: { ...exception } } as BaseErrorArgs); //TODO Ove Test if this works
//     }
// }

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

export const createSuccess = (): Result => {
    return { isSuccess: true } as Result;
};

export const createError = (error: SearchModuleError): Result => {
    return { isSuccess: false, error } as Result;
};

export function createNotImplementedError(message: string): Result {
    return createError({ type: ErrorType.NotImplemented, message: message });
}

export function createSyncError(message: string): Result {
    return createError({ type: ErrorType.SyncFailed, message: message });
}

export function createSearchModuleErrorFromError(error: Error | BaseError): Result {
    let errorType = ErrorType.SyncFailed;
    if (error instanceof SyncCanceledError) {
        errorType = ErrorType.SyncCanceled;
    }
    //todo url and statusCode?
    return createError({ type: errorType, message: error.message, name: error.name, stack: error.stack });
}

// enum ErrorType {
//     SyncIsNotEnabled,
//     NetworkErrorForbidden,
//     NetworkErrorInternalServerError,
//     NetworkErrorBadRequest
// }

export enum ErrorType {
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
