import { Result } from './baseResult';
import { echoSearchWorker } from './echoWorkerInstance';
import { OfflineSystem } from './offlineSync/syncSettings';
import { getApiTokenInMainThread } from './tokenHelperMainThread';

export const sleep = (ms: number): Promise<unknown> => new Promise((res) => setTimeout(res, ms));
export async function SearchDummyTest(sleepCount: number): Promise<string> {
    let value = 0;
    for (let index = 0; index < sleepCount; index++) {
        console.log('going to sleep 77', value);
        await sleep(1000);
        value++;
    }

    return 'search dummy test done' + value;
}

const SearchTags = {
    searchAsync: echoSearchWorker.searchTags,
    closestTagAsync: echoSearchWorker.searchForClosestTagNo,
    getAsync: echoSearchWorker.lookupTagAsync,
    bulkGetAsync: echoSearchWorker.lookupTagsAsync
};

const SearchPunches = {
    searchAsync: echoSearchWorker.searchPunches,
    getAsync: echoSearchWorker.lookupPunchAsync,
    bulkGetAsync: echoSearchWorker.lookupPunchesAsync
};

const SearchMcPacks = {
    searchAsync: echoSearchWorker.searchMcPacks,
    getAsync: echoSearchWorker.lookupPunchAsync,
    bulkGetAsync: echoSearchWorker.lookupPunchesAsync
};

const searchNotifications = {
    searchAsync: echoSearchWorker.searchNotifications,
    getAsync: {},
    bulkGetAsync: {}
};

export const Search = {
    Tags: SearchTags,
    Punch: SearchPunches,
    McPacks: SearchMcPacks,
    Notifications: searchNotifications,
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
export type { SearchResult, SearchResults } from './inMemory/searchResult';
export type { TagStatus, TagSummaryDb } from './offlineSync/tagSyncer/tagSummaryDb';
