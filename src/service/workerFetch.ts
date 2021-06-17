import { initializeError, NetworkError, NetworkErrorArgs } from '@equinor/echo-base';
import { logInfo, logPerformance } from '../logger';
import { getToken } from '../tokenHelper';

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

export const workerFetch = async (
    endpoint: string,
    token: string,
    logFetchToConsole = true,
    headerOptions: Record<string, unknown> = {},
    method = 'GET',
    body?: Body,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signal?: AbortSignal
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

    logFetchToConsole && logInfo('Fetch', endpoint);
    const performanceLogger = logPerformance();
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
        const error = initializeError(NetworkError, args);
        // keep console.log('real', JSON.parse(JSON.stringify(error)));
        throw error;
    }
}

export async function apiFetch(url: string): Promise<Response> {
    const response = await workerFetch(url, getToken());
    await throwErrorIfNotSuccess(response, url);
    return response;
}

/**
 * Fetch url and deserialize the json to array of specified return type.
 * Throws NetworkError on none successful response
 * @param url The url to fetch
 * @returns An array of the specified return type
 */
export async function apiFetchJsonToArray<T>(url: string): Promise<T[]> {
    logInfo('Fetch:', url);
    const performanceLogger = logPerformance();
    const response = await workerFetch(url, getToken(), false);
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
