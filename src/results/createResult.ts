import { Result, ResultArray, ResultValue, SyncErrorType } from './baseResult';
import { createError, createResultErrorFromException, ErrorMessage } from './errors';

const createSuccess = (): Result => {
    return { isSuccess: true };
};

class SingleValueResult {
    successOrNotFound<T>(value: T | undefined): ResultValue<T> {
        return { isSuccess: true, value, isNotFound: value === undefined };
    }
    error<T>(errorMessage: ErrorMessage): ResultValue<T> {
        return { ...result.syncError(errorMessage), isNotFound: false };
    }
}

class ArrayValueResults {
    // error<T>(exception: Error | BaseError): ResultArray<T> {
    //     const errorResult = result.errorFromException(exception);
    //     return { isSuccess: false, values: [], error: errorResult.error };
    // }

    successOrEmpty<T>(values: T[]): ResultArray<T> {
        return { isSuccess: true, values };
    }

    error<T>(errorMessage: ErrorMessage): ResultArray<T> {
        return { ...result.syncError(errorMessage), values: [] };
    }
}

export const result = {
    success: createSuccess,
    errorFromException: createResultErrorFromException,
    syncError: (message: ErrorMessage): Result => createError({ type: SyncErrorType.SyncFailed, message: message }),
    //error: (type: SyncErrorType, message: string): Result => createError({ type, message }),
    notImplementedError: (message: string): Result =>
        createError({ type: SyncErrorType.NotImplemented, message: message })
};

export const resultValue = new SingleValueResult();

export const resultArray = new ArrayValueResults();

//ErrorType worth considering
//type Failure = string;

// export interface Failure<FailureType extends string> {
//     type: FailureType;
//     reason: string;
// }
//interface FailureType extends string{}
