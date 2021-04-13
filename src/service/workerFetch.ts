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
    headerOptions: Record<string, unknown> = {},
    method = 'GET',
    body?: Body,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleClientError?: (ex: unknown, statusCode: number, endpoint: string) => any,
    signal?: AbortSignal
): Promise<Response> => {
    let statusCode = 0;

    if (!token.toLowerCase().includes('bearer')) token = 'Bearer ' + token;

    try {
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

        console.log('Fetch', endpoint);
        const response: Response = await fetch(endpoint, {
            method,
            headers: headers,
            body: body,
            signal
        });
        console.log('Done', response.status, response.statusText, endpoint);

        if (response.status) statusCode = response.status;

        if (response && !response.ok) {
            const contentType = response.headers.get('content-type');
            console.warn('response not ok', response.statusText);
            if (contentType && contentType.indexOf('application/json') !== -1) {
                const moreInfo = await response.json();
                throw new Error(response.status + ' ' + endpoint + ' ' + moreInfo);
            } else {
                const moreInfo = await response.text();
                throw new Error(response.status + ' ' + endpoint + ' ' + moreInfo);
            }
        }
        return response;
    } catch (ex) {
        console.log('error in worker fetch', ex);
        if (handleClientError) {
            console.log('handle client error');
            const handledError = handleClientError(ex, statusCode, endpoint);
            throw handledError;
        } else {
            console.log('rethrow error');
            throw ex;
        }
    }
};

export async function apiFetch(url: string): Promise<Response> {
    return await workerFetch(url, getToken());
}
