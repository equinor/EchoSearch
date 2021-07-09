import EchoCore from '@equinor/echo-core';
import { logger } from './logger';

const log = logger('Token');
export async function getApiTokenInMainThread(): Promise<string> {
    try {
        return await EchoCore.EchoClient.getAccessToken();
    } catch (e) {
        log.error('Token FAILED', e);
        throw e;
    }
}
