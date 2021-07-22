import { SearchResult, SearchResults } from '..';
import { inMemory } from '../inMemory/inMemoryExports';
import { Filter } from '../inMemory/searchFilter';
import { punchesRepository } from '../offlineSync/punchSyncer/punchRepository';
import { punchesSyncSystem } from '../offlineSync/punchSyncer/punchSyncer';
import { OfflineSystem } from '../offlineSync/syncSettings';
import { PunchDto } from './dataTypes';
import { SearchSystem } from './searchSystem';

let _punchSearchSystem: SearchSystem<PunchDto>;

async function initTask(): Promise<void> {
    const initPunchesTask = punchesSyncSystem.initTask();

    _punchSearchSystem = new SearchSystem<PunchDto>(OfflineSystem.Punches, initPunchesTask, () =>
        inMemory.Punches.isReady()
    );
    await initPunchesTask;
}

export async function search(
    searchText: string,
    maxHits: number,
    tryToApplyFilter?: Filter<PunchDto>
): Promise<SearchResults<PunchDto>> {
    return await _punchSearchSystem.search(
        async () => inMemory.Punches.search(searchText, maxHits, tryToApplyFilter),
        async () => []
    );
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
