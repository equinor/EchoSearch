import { Result } from './baseResult';
import { echoSearchWorker } from './echoWorkerInstance';
import { SearchResult, SearchResults } from './inMemory/searchResult';
import { OfflineSystem } from './offlineSync/syncSettings';
import { TagStatus } from './offlineSync/tagSyncer/tagSummaryDb';
import { getApiTokenInMainThread } from './tokenHelperMainThread';
import { McPackDto, NotificationDto, PunchDto, TagSummaryDto } from './workers/dataTypes';

export type { Result };
export type { SearchResult, SearchResults };
export type { TagStatus, TagSummaryDto };
export type { McPackDto, NotificationDto, PunchDto };

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
    getAllAsync: echoSearchWorker.lookupTagsAsync
};

const searchPunches = {
    searchAsync: echoSearchWorker.searchPunches,
    getAsync: echoSearchWorker.lookupPunchAsync,
    getAllAsync: echoSearchWorker.lookupPunchesAsync
};

const searchMcPacks = {
    searchAsync: echoSearchWorker.searchMcPacks,
    getAsync: echoSearchWorker.lookupPunchAsync,
    getAllAsync: echoSearchWorker.lookupPunchesAsync
};

const searchNotifications = {
    searchAsync: echoSearchWorker.searchNotifications,
    searchByTagNosAsync: echoSearchWorker.searchNotificationsByTagNos,
    getAsync: echoSearchWorker.lookupNotificationAsync,
    getAllAsync: echoSearchWorker.lookupNotificationsAsync
};

const logConfiguration = {
    setLevel: echoSearchWorker.setLogLevel,
    setLevels: echoSearchWorker.setLogLevels,
    setDefaultLevel: echoSearchWorker.setDefaultLogLevel,
    getDefaultLevel: echoSearchWorker.getDefaultLogLevel,
    getLevel: echoSearchWorker.getLogLevel
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
    isEnabledAsync: echoSearchWorker.isEnabledAsync,
    setEnabledAsync: echoSearchWorker.setEnabledAsync,
    changePlantAsync: async (instCode: string, forceDeleteIfSameAlreadySelected = false): Promise<Result> =>
        await echoSearchWorker.changePlantAsync(instCode, forceDeleteIfSameAlreadySelected),
    OfflineSystem,
    logConfiguration: logConfiguration
};
