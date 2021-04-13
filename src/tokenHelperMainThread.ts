import EchoCore from '@equinor/echo-core';
export async function getApiTokenInMainThread(): Promise<string> {
    return await EchoCore.EchoClient.getAccessToken();
}
