import { BaseError, BaseErrorArgs } from '@equinor/echo-base';

export interface Result {
    readonly isSuccess: boolean;
    readonly error?: SearchModuleError; //TODO Ove, convert to error enum type?
}

export class SearchModuleError extends BaseError {
    constructor(message: string, exception?: Error) {
        super({ message, exception: { ...exception } } as BaseErrorArgs); //TODO Ove Test if this works
    }
}

export interface InternalSyncResult extends Result {
    newestItemDate?: Date;
    itemsSyncedCount: number;
}

export class DbError extends SearchModuleError {}

export class NotImplementedError extends SearchModuleError {}
export class JsonParseError extends SearchModuleError {}
export class SyncError extends SearchModuleError {}
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
    return createError(new NotImplementedError(message));
}

export function createSyncError(message: string): Result {
    return createError(new SyncError(message));
}

// enum ErrorType {
//     SyncIsNotEnabled,
//     NetworkErrorForbidden,
//     NetworkErrorInternalServerError,
//     NetworkErrorBadRequest
// }
