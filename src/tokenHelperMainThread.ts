import EchoCore from '@equinor/echo-core';
export async function getApiTokenInMainThread(): Promise<string | undefined> {
    try {
        const token = await EchoCore.EchoClient.getAccessToken();
        console.log('Current Token', token);
        return token;
    } catch (error) {
        console.log(error);
    }
}
