import { NotInitializedError } from './baseResult';
import { loggerFactory } from './logger';

let _apiAccessToken = '';
const log = loggerFactory.default('Worker.Token');

export function setTokenInWorker(apiAccessToken: string): void {
    if (!_apiAccessToken) log.trace('token initialized');
    _apiAccessToken = apiAccessToken;
}

export function getTokenInWorker(): string {
    if (!_apiAccessToken) throw new NotInitializedError('Not logged in yet, token missing'); //TODO Ask Chris - request a token if it's missing
    return _apiAccessToken;
}
