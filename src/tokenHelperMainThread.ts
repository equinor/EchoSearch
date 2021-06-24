import EchoCore from '@equinor/echo-core';
export async function getApiTokenInMainThread(): Promise<string> {
    console.log('trying to get token');

    try {
        const result = await EchoCore.EchoClient.getAccessToken();
        //console.log('token', result);
        return result;
    } catch (e) {
        console.error('failed to get token-------------');
        throw e;
    }
}
