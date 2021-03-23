export function getToken(): string {
    const token = 'ey...';
    if (token.length < 15) console.error('bearer token has not been set');

    return token;
}
