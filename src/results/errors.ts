import {
    BaseError,
    BaseErrorArgs,
    ErrorProperties,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError
} from '@equinor/echo-base';
import { OfflineSystem } from '../offlineSync/offlineSystem';
import { Opaque } from '../utils/opague';
import { Result, SearchModuleError, SyncErrorType } from './baseResult';

export class SyncError extends BaseError {
    constructor(message: string, exception?: Error) {
        super({ message, exception: { ...exception } } as BaseErrorArgs); //TODO Ove Test if this works
    }
}
export class JsonParseError extends SyncError {}
export class ArgumentError extends SyncError {}
export class ArgumentDateError extends ArgumentError {}
export class DbError extends SyncError {}

export class NotInitializedError extends SyncError {}

export class NotImplementedError extends SyncError {}

export class SyncNotEnabledError extends SyncError {}

export class SyncCanceledError extends SyncError {
    constructor(message: string) {
        super(message);
        this.hasBeenLogged = true; //expected - should not be logged
    }
}

export const createError = (error: SearchModuleError): Result => {
    return { isSuccess: false, error };
};

export function createResultErrorFromException<T extends Result>(error: Error | BaseError): T {
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

export type ErrorMessage = Opaque<string, 'ErrorMessage'>;

const syncErrorMessages = {
    notEnabled: (key: OfflineSystem): ErrorMessage => `Sync is not enabled for ${key}` as ErrorMessage,
    syncNeededBeforeSearch: (key: OfflineSystem): ErrorMessage =>
        `Search error, sync is needed for ${key}` as ErrorMessage
};

export const errorMessage = {
    sync: syncErrorMessages,
    inMemoryDataNotReady: (): ErrorMessage =>
        `Search error, in memory data is not ready, init/sync needed` as ErrorMessage
};
