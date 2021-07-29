import { Result, SyncErrorType } from './baseResult';
import { echoSearchWorker } from './echoWorkerInstance';
import { SearchResult, SearchResults } from './inMemory/searchResult';
import { LogType } from './loggerOptions';
import { OfflineSystem } from './offlineSync/syncSettings';
import { TagStatus } from './offlineSync/tagSyncer/tagSummaryDb';
import { getApiTokenInMainThread } from './tokenHelperMainThread';
import { CommPackDto, McPackDto, NotificationDto, PunchDto, TagSummaryDto } from './workers/dataTypes';

export type { Result };
export type { SearchResult, SearchResults };
export type { TagStatus, TagSummaryDto };
export type { McPackDto, CommPackDto, NotificationDto, PunchDto };

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

const searchDocuments = {
    searchAsync: echoSearchWorker.searchDocumentsAsync,
    getAsync: echoSearchWorker.lookupDocumentAsync,
    getAllAsync: echoSearchWorker.lookupAllDocumentsAsync
};

const searchPunches = {
    searchAsync: echoSearchWorker.searchPunches,
    getAsync: echoSearchWorker.lookupPunchAsync,
    getAllAsync: echoSearchWorker.lookupPunchesAsync
};

const searchMcPacks = {
    /**
     * Search for mcPacks. Uses Offline search, except when it's syncing all items the first time.
     * @param searchText The text to search for.
     * @param maxHits Max hits to return. May return more than if online search, since we do multiple searches online, and can't determine the best hits properly.
     * @param tryToApplyFilter Applies the filter fully if offline Search. Applies the filter partially if online-search (projectCode).
     */
    searchAsync: echoSearchWorker.searchMcPacks,
    getAsync: echoSearchWorker.lookupMcPackAsync,
    getAllAsync: echoSearchWorker.lookupMcPacksAsync
};

const searchCommPacks = {
    searchAsync: echoSearchWorker.searchCommPacks,
    getAsync: echoSearchWorker.lookupCommPackAsync,
    getAllAsync: echoSearchWorker.lookupCommPacksAsync
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
    getLevel: echoSearchWorker.getLogLevel,
    LogType: LogType
};

const debugOptions = {
    setFailureRate: echoSearchWorker.setFailureRateAsync
};

const syncConfiguration = {
    async setApiBaseUrl(apiBaseUrl: string): Promise<void> {
        await echoSearchWorker.setApiBaseUrl(apiBaseUrl);

        await updateAccessToken();
    },

    log: logConfiguration,

    debugOptions
};

export const Search = {
    Tags: searchTags,
    Documents: searchDocuments,
    Punch: searchPunches,
    McPacks: searchMcPacks,
    CommPacks: searchCommPacks,
    Notifications: searchNotifications,
    OfflineSystem,
    ErrorType: SyncErrorType //TODO Ove - should this be the same as syncError?
};

export const Syncer = {
    async runSyncAsync(offlineSystemKey: OfflineSystem): Promise<Result> {
        const token = await getApiTokenInMainThread();
        return await echoSearchWorker.runSyncWorkerAsync(offlineSystemKey, token);
    },
    isEnabledAsync: async (offlineSystemKey: OfflineSystem): Promise<boolean> =>
        (await echoSearchWorker.isEnabledAsync(offlineSystemKey)).value === true,

    setEnabledAsync: echoSearchWorker.setEnabledAsync,
    changePlantAsync: async (instCode: string, forceDeleteIfSameAlreadySelected = false): Promise<Result> =>
        await echoSearchWorker.changePlantAsync(instCode, forceDeleteIfSameAlreadySelected),
    OfflineSystem,

    configuration: syncConfiguration,

    ErrorType: SyncErrorType
};

async function updateAccessToken() {
    const token = await getApiTokenInMainThread();
    await echoSearchWorker.setAccessToken(token);
}
