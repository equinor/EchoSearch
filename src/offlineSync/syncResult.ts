import { BaseError, BaseErrorArgs } from '@equinor/echo-base';

export interface SearchModuleResult {
    readonly isSuccess: boolean;
    readonly error?: SearchModuleError; //TODO Ove, convert to error enum type?
}

export class SearchModuleError extends BaseError {
    constructor(message: string, exception?: Error) {
        super({ message, exception: { ...exception } } as BaseErrorArgs); //TODO Ove Test if this works
    }
}

export interface InternalSyncResult extends SearchModuleResult {
    newestItemDate?: Date;
    itemsSyncedCount: number;
}

export class DbError extends SearchModuleError {}

export class NotImplementedError extends SearchModuleError {}
export class JsonParseError extends SearchModuleError {}
export class SyncError extends SearchModuleError {}

export class SyncCanceledError extends SyncError {
    constructor(message: string) {
        super(message);
        this.hasBeenLogged = true; //expected - should not be logged
    }
}

export const createSuccess = (): SearchModuleResult => {
    return { isSuccess: true } as SearchModuleResult;
};

export const createError = (error: SearchModuleError): SearchModuleResult => {
    return { isSuccess: false, error } as SearchModuleResult;
};

export function createNotImplementedError(message: string): SearchModuleResult {
    return createError(new NotImplementedError(message));
}

export function createSyncError(message: string): SearchModuleResult {
    return createError(new SyncError(message));
}

// enum ErrorType {
//     SyncIsNotEnabled,
//     NetworkErrorForbidden,
//     NetworkErrorInternalServerError,
//     NetworkErrorBadRequest
// }
