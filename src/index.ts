import { echoSearchWorker } from './echoWorkerInstance';
import { OfflineSystem } from './offlineSync/syncSettings';
import { getApiTokenInMainThread } from './tokenHelperMainThread';

export const Search = {
    closestTagSearchAsync: echoSearchWorker.searchForClosestTagNo,
    searchTagsAsync: echoSearchWorker.searchTags,
    searchMcPacksAsync: echoSearchWorker.searchMcPacks,
    searchPunchesAsync: echoSearchWorker.searchPunches
};

export const Lookup = {
    lookupTagAsync: echoSearchWorker.lookupTagAsync,
    lookupTagsAsync: echoSearchWorker.lookupTagsAsync
};

export const Syncer = {
    async runSyncAsync(offlineSystemKey: OfflineSystem): Promise<void> {
        const token = await getApiTokenInMainThread();
        await echoSearchWorker.runSyncWorkerAsync(offlineSystemKey, token);
    },
    setEnabledAsync: echoSearchWorker.setEnabled,
    changePlantAsync: echoSearchWorker.changePlantAsync
};
