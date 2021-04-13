let _apiAccessToken = '';
export function setToken(apiAccessToken: string): void {
    _apiAccessToken = apiAccessToken;
}
export function getToken(): string {
    return _apiAccessToken;
}
