import { BaseError, ErrorProperties, ForbiddenError, UnauthorizedError } from '@equinor/echo-base';
import { NotFoundError } from 'rxjs';
import {
    ArgumentError,
    NotInitializedError,
    Result,
    SearchModuleError,
    SyncCanceledError,
    SyncErrorType
} from './baseResult';

const createSuccess = (): Result => {
    return { isSuccess: true };
};

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

export const result = {
    success: createSuccess,
    errorFromException: createResultErrorFromException,
    syncError: (message: string): Result => createError({ type: SyncErrorType.SyncFailed, message: message }),
    error: (type: SyncErrorType, message: string): Result => createError({ type, message }),
    notImplementedError: (message: string): Result =>
        createError({ type: SyncErrorType.NotImplemented, message: message })
};
