import { NotInitializedError } from './baseResult';

let _apiAccessToken = '';
export function setToken(apiAccessToken: string): void {
    _apiAccessToken = apiAccessToken;
}
export function getToken(): string {
    if (!_apiAccessToken) throw new NotInitializedError('Not logged in yet, token missing'); //TODO - request a token if it's missing
    return _apiAccessToken;
}
