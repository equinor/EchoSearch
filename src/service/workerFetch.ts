import { initializeError, NetworkError, NetworkErrorArgs, NotFoundError } from '@equinor/echo-base';
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

    logFetchToConsole && console.log('Fetch', endpoint);
    const response: Response = await fetch(endpoint, {
        method,
        headers: headers,
        body: body,
        signal
    });
    logFetchToConsole && console.log('Done', response.status, response.statusText, endpoint);
    await throwErrorIfNotSuccess(response, endpoint);

    return response;
};

async function throwErrorIfNotSuccess(response: Response, url: string): Promise<void> {
    if (response && !response.ok) {
        const contentType = response.headers.get('content-type');
        console.warn('response not ok', response.status, response.statusText);
        const moreInfo =
            contentType && contentType.indexOf('application/json') !== -1
                ? await response.json()
                : await response.text();

        console.log('more info: ', moreInfo);

        const args: NetworkErrorArgs = {
            message: `${response.status} ${response.statusText}`.trim(),
            httpStatusCode: response.status,
            url: url,
            exception: moreInfo
        };
        console.log('args', args);
        const error = initializeError(NetworkError, args);
        console.log('done initializeError', error instanceof NotFoundError, error);

        console.log('real', JSON.parse(JSON.stringify(error)));
        throw error;
    }
}

/*
            const errorInstance = initializeError(NetworkError, {
                httpStatusCode: statusCode,
                url: endpoint,
                exception
            });
            throw errorInstance;

*/

export async function apiFetch(url: string): Promise<Response> {
    const result = await workerFetch(url, getToken());
    return result;
}

/**
 * Fetch url and deserialize the json to array of specified return type.
 * Throws NetworkError on none successful response
 * @param url The url to fetch
 * @returns An array of the specified return type
 */
export async function apiFetchJsonToArray<T>(url: string): Promise<T[]> {
    console.log('Fetch:', url);
    const response = await workerFetch(url, getToken(), false);
    if (response.status === 200) {
        const result = (await response.json()) as T[];
        console.log('Done: ', response.status, 'items:', result.length, url);
        return result;
    } else {
        console.log('Done: ', response.status, url);
    }

    await throwErrorIfNotSuccess(response, url);
    return [];
    //LaterDo json parse error is possible..
}
