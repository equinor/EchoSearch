import { Result } from './baseResult';
import { echoSearchWorker } from './echoWorkerInstance';
import { OfflineSystem } from './offlineSync/syncSettings';
import { getApiTokenInMainThread } from './tokenHelperMainThread';

export const Search = {
    closestTagSearchAsync: echoSearchWorker.searchForClosestTagNo,
    searchTagsAsync: echoSearchWorker.searchTags,
    searchMcPacksAsync: echoSearchWorker.searchMcPacks,
    searchPunchesAsync: echoSearchWorker.searchPunches,
    OfflineSystem
};

export const Lookup = {
    lookupTagAsync: echoSearchWorker.lookupTagAsync,
    lookupTagsAsync: echoSearchWorker.lookupTagsAsync,

    lookupPunchAsync: echoSearchWorker.lookupPunchAsync,
    lookupPunchesAsync: echoSearchWorker.lookupPunchesAsync,

    lookupMcPackAsync: echoSearchWorker.lookupMcPackAsync,
    lookupMcPacksAsync: echoSearchWorker.lookupMcPacksAsync,
    OfflineSystem
};

export const Syncer = {
    async runSyncAsync(offlineSystemKey: OfflineSystem): Promise<Result> {
        const token = await getApiTokenInMainThread();
        return await echoSearchWorker.runSyncWorkerAsync(offlineSystemKey, token);
    },
    setEnabledAsync: echoSearchWorker.setEnabled,
    changePlantAsync: echoSearchWorker.changePlantAsync,
    OfflineSystem
};

export type { Result } from './baseResult';
export { echoSearchWorker } from './echoWorkerInstance';
export type { SearchResult, SearchResults } from './inMemory/searchResult';
export { logger } from './logger';
export { OfflineSystem } from './offlineSync/syncSettings';
export type { TagStatus, TagSummaryDb } from './offlineSync/tagSyncer/tagSummaryDb';
