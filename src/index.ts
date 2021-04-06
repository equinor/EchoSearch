import { echoSearchWorker } from './echoWorkerInstance';
import { OfflineSystem } from './offlineSync/syncSettings';
import { TagSummaryDb } from './offlineSync/tagSyncer/tagSummaryDb';

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
        await echoSearchWorker.runSyncWorkerAsync(offlineSystemKey);
    }
    async setEnabledAsync(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<void> {
        await echoSearchWorker.setEnabled(offlineSystemKey, isEnabled);
    }

    async changePlantAsync(): Promise<void> {
        await echoSearchWorker.changePlantAsync('JSV');
    }
}

export const search = new Search();
export const syncer = new Syncer();
