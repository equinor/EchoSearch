import EchoCore from '@equinor/echo-core';
export async function getApiTokenInMainThread(): Promise<string> {
    const token = await EchoCore.EchoClient.getAccessToken();
    console.log('Current Token', token);
    return token;
}
