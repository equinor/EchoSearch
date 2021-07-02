import EchoCore from '@equinor/echo-core';
import { logger } from './logger';

const log = logger('Token');
export async function getApiTokenInMainThread(): Promise<string> {
    try {
        const token = await EchoCore.EchoClient.getAccessToken();
        log.trace('Token SUCCESS:', token.length > 0);
        return token;
    } catch (e) {
        log.error('Token FAILED', e);
        throw e;
    }
}
