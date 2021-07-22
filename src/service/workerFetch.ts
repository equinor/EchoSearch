import { initializeError, NetworkError, NetworkErrorArgs } from '@equinor/echo-base';
import { logger } from '../logger';
import { getToken } from '../tokenHelper';

const log = logger('FETCH');

type Body =
    | string
    | Blob
    | ArrayBufferView
    | ArrayBuffer
    | FormData
    | URLSearchParams
    | ReadableStream<Uint8Array>
    | null
    | undefined;

const workerFetch = async (
    endpoint: string,
    token: string,
    signal?: AbortSignal,
    logFetchToConsole = true,
    method = 'GET',
    headerOptions: Record<string, unknown> = {},
    body?: Body
): Promise<Response> => {
    if (!token.toLowerCase().includes('bearer')) token = 'Bearer ' + token;

    const headers = body
        ? {
              Authorization: token,
              ...headerOptions
          }
        : {
              Authorization: token,
              'Content-Type': 'application/json',
              ...headerOptions
          };

    logFetchToConsole && log.info(endpoint);
    const performanceLogger = log.performance();
    const response: Response = await fetch(endpoint, {
        method,
        headers: headers,
        body: body,
        signal
    });
    logFetchToConsole && performanceLogger.forceLog(`Done ${response.status} ${endpoint}`);

    return response;
};

async function throwErrorIfNotSuccess(response: Response, url: string): Promise<void> {
    if (response && !response.ok) {
        const contentType = response.headers.get('content-type');
        const moreInfo =
            contentType && contentType.indexOf('application/json') !== -1
                ? await response.json()
                : await response.text();

        // keep console.log('more info: ', moreInfo);

        const args: NetworkErrorArgs = {
            message: `${response.status} ${response.statusText}`.trim(),
            httpStatusCode: response.status,
            url: url,
            exception: moreInfo
        };
        throw initializeError(NetworkError, args);
        // keep console.log('real error', JSON.parse(JSON.stringify(error)));
    }
}

export async function apiFetch(url: string, abortSignal: AbortSignal): Promise<Response> {
    const response = await workerFetch(url, getToken(), abortSignal);
    await throwErrorIfNotSuccess(response, url);
    return response;
}

export async function apiFetchToType<T>(url: string, abortSignal: AbortSignal): Promise<T> {
    const response = await workerFetch(url, getToken(), abortSignal);
    await throwErrorIfNotSuccess(response, url);
    return (await response.json()) as T;
}

/**
 * Fetch url and deserialize the json to array of specified return type.
 * Throws NetworkError on none successful response
 * @param url The url to fetch
 * @returns An array of the specified return type
 */
export async function apiFetchJsonToArray<T>(url: string, abortSignal?: AbortSignal): Promise<T[]> {
    log.info(url);
    const performanceLogger = log.performance();
    const response = await workerFetch(url, getToken(), abortSignal, false);
    if (response.status === 200) {
        const result = (await response.json()) as T[];
        performanceLogger.forceLog(`Done ${response.status} items: ${result.length} ${url}`);
        return result;
    } else {
        performanceLogger.forceLog(`Done ${response.status} ${url}`);
    }

    await throwErrorIfNotSuccess(response, url);
    return []; //no data returned in response
    //LaterDo json parse error is possible..
}
