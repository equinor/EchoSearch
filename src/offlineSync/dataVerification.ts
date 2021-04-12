import { logWarn } from '../logger';
import { OfflineSystem } from './syncSettings';
export async function verifyCount(
    actualCount: number,
    estimatedCount: () => Promise<number>,
    offlineSystemKey?: OfflineSystem,
    tolerance = 0.9
): Promise<boolean> {
    const estimated = await estimatedCount();
    const verified = estimated == 0 || (estimated > 0 && actualCount >= estimated * tolerance);
    if (!verified && offlineSystemKey)
        logWarn(`Verify ${offlineSystemKey} failed - we only have ${actualCount} of estimated ${estimated}`);
    return verified;
}
