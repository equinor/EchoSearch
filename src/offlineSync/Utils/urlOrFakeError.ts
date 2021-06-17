import { baseApiUrl } from '../syncSettings';
import { ToggleState } from '../toggleState';

const _randomApiError = new ToggleState(false);
/**
 * If random api error is enabled, the specified or random error is returned from the api.
 */
export function urlOrFakeError(url: string, httpStatusCode = 404, errorMessage = 'errorMessage'): string {
    if (!_randomApiError.isEnabled) return url;
    return `${baseApiUrl}/TroubleShooting/FakeError?httpStatusCode=${httpStatusCode}&message=${errorMessage}`;
}
