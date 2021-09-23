import { BaseError } from '@equinor/echo-base';
import { Result, ResultArray, ResultValue } from '..';
import { logger } from '../logger';
import { result } from './createResult';

/**
 * Run function in try/catch, and return error as result.Error (interface SearchModuleError).
 * We convert to interface, since CommLink is struggling with classes.
 * tryCatchTo.Result, Value, Array: will initialize all variables in the specific result interface.
 */

const log = logger('EchoSearchWorker.TryCatch');

async function tryCatchToResultT<T extends Result>(func: () => Promise<T>): Promise<T> {
    try {
        const funcResult = await func();
        if (!funcResult.isSuccess) log.debug('Error:', funcResult.error);
        return funcResult;
    } catch (error) {
        log.warn('we caught an error: ', error);
        return result.errorFromException(error as BaseError | Error) as T; //TODO Ove Test
    }
}

async function tryCatchToResult(func: () => Promise<Result>): Promise<Result> {
    return await tryCatchToResultT(func);
}

async function tryCatchToResultValue<T>(func: () => Promise<ResultValue<T>>): Promise<ResultValue<T>> {
    const value = await tryCatchToResultT(func);
    return { ...value, isNotFound: false };
}

async function tryCatchToResultArray<T>(func: () => Promise<ResultArray<T>>): Promise<ResultArray<T>> {
    const value = await tryCatchToResultT(func);
    return { ...value, values: [] as T[] };
}

export const tryCatchTo = {
    result: tryCatchToResult,
    value: tryCatchToResultValue,
    array: tryCatchToResultArray
};
