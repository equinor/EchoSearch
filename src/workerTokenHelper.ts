import { loggerFactory } from './logger';
import { NotInitializedError } from './results/baseResult';
const log = loggerFactory.default('Worker.Token');

let getToken: () => Promise<string>;

export function setTokenGetterInWorker(getTokenFunc: () => Promise<string>): void {
    getToken = getTokenFunc;
}

export async function getTokenInWorkerAsync(): Promise<string> {
    if (!getToken)
        throw new NotInitializedError('Not logged in yet, missing function getToken() , did you forget to initialize?');
    const token = await getToken();
    log.trace('Got token in worker:', token ? true : false);
    return token;
}
