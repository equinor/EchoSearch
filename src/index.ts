import { echoSearchWorker } from './echoWorkerInstance';
import { OfflineSystem } from './offlineSync/syncSettings';
import { TagSummaryDb } from './offlineSync/tagSyncer/tagSummaryDb';
import { getApiTokenInMainThread } from './tokenHelperMainThread';

//This file contains Everything that should be exported to consumers of this library.

class Search {
    async closestTagSearchAsync(tagNoSearch: string): Promise<string | undefined> {
        return await echoSearchWorker.searchForClosestTagNo(tagNoSearch);
    }

    async searchAsync(offlineSystemKey: OfflineSystem, searchText: string, maxHits: number): Promise<TagSummaryDb[]> {
        return await echoSearchWorker.searchTags(searchText, maxHits);
    }
}

class Syncer {
    async runSyncAsync(offlineSystemKey: OfflineSystem): Promise<void> {
        const token = await getApiTokenInMainThread();
        await echoSearchWorker.runSyncWorkerAsync(offlineSystemKey, token);
    }
    async setEnabledAsync(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<void> {
        await echoSearchWorker.setEnabled(offlineSystemKey, isEnabled);
    }

    async changePlantAsync(instCode: string): Promise<void> {
        await echoSearchWorker.changePlantAsync(instCode);
    }
}

export const search = new Search();
export const syncer = new Syncer();
