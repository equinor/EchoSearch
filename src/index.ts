import { Result } from './baseResult';
import { echoSearchWorker } from './echoWorkerInstance';
import { SearchResult, SearchResults } from './inMemory/searchResult';
import { McPackDb } from './offlineSync/mcPacksSyncer/mcPacksApi';
import { NotificationDb } from './offlineSync/notificationSyncer/notificationApi';
import { PunchDb } from './offlineSync/punchSyncer/punchApi';
import { OfflineSystem } from './offlineSync/syncSettings';
import { TagStatus, TagSummaryDb } from './offlineSync/tagSyncer/tagSummaryDb';
import { getApiTokenInMainThread } from './tokenHelperMainThread';

export type { Result };
export type { SearchResult, SearchResults };
export type { TagStatus, TagSummaryDb };
export type { McPackDb, NotificationDb, PunchDb };

export async function SearchDummyTest(sleepCount: number): Promise<string> {
    let value = 0;
    const sleep = (ms: number): Promise<unknown> => new Promise((res) => setTimeout(res, ms));
    for (let index = 0; index < sleepCount; index++) {
        console.log('going to sleep 77', value);
        await sleep(1000);
        value++;
    }

    return 'search dummy test done' + value;
}

const searchTags = {
    searchAsync: echoSearchWorker.searchTags,
    closestTagAsync: echoSearchWorker.searchForClosestTagNo,
    getAsync: echoSearchWorker.lookupTagAsync,
    bulkGetAsync: echoSearchWorker.lookupTagsAsync
};

const searchPunches = {
    searchAsync: echoSearchWorker.searchPunches,
    getAsync: echoSearchWorker.lookupPunchAsync,
    bulkGetAsync: echoSearchWorker.lookupPunchesAsync
};

const searchMcPacks = {
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
    Tags: searchTags,
    Punch: searchPunches,
    McPacks: searchMcPacks,
    Notifications: searchNotifications,
    OfflineSystem
};

export const Syncer = {
    async runSyncAsync(offlineSystemKey: OfflineSystem): Promise<Result> {
        const token = await getApiTokenInMainThread();
        return await echoSearchWorker.runSyncWorkerAsync(offlineSystemKey, token);
    },
    setEnabledAsync: echoSearchWorker.setEnabled,
    changePlantAsync: async (instCode: string, forceDeleteIfSameAlreadySelected = false): Promise<Result> =>
        await echoSearchWorker.changePlantAsync(instCode, forceDeleteIfSameAlreadySelected),
    OfflineSystem
};
