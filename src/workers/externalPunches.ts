import { SearchResult, SearchResults } from '..';
import { inMemory } from '../inMemory/inMemoryExports';
import { notificationsSyncSystem } from '../offlineSync/notificationSyncer/notificationSyncer';
import { punchesRepository } from '../offlineSync/punchSyncer/punchRepository';
import { OfflineSystem } from '../offlineSync/syncSettings';
import { PunchDto } from './dataTypes';
import { SearchSystem } from './searchSystem';

let _punchSearchSystem: SearchSystem<PunchDto>;

async function initTask(): Promise<void> {
    const initPunchesTask = notificationsSyncSystem.initTask();

    _punchSearchSystem = new SearchSystem<PunchDto>(
        OfflineSystem.Punches,
        initPunchesTask,
        () => inMemory.Punches.isReady(),
        async (searchText, maxHits) => inMemory.Punches.search(searchText, maxHits),
        async () => []
        //async (searchText, maxHits) => [], //searchTagsOnline(searchText, maxHits),
    );
    await initPunchesTask;
}

export async function search(searchText: string, maxHits: number): Promise<SearchResults<PunchDto>> {
    return await _punchSearchSystem.search(searchText, maxHits);
}

export async function lookup(id: string): Promise<SearchResult<PunchDto>> {
    return await punchesRepository().get(id);
}

export async function lookupAll(ids: string[]): Promise<SearchResults<PunchDto>> {
    return await punchesRepository().bulkGet(ids);
}

export const externalPunches = {
    initTask,
    //searchByTagNos,
    search,
    lookup,
    lookupAll
};
