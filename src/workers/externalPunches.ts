import { inMemory } from '../inMemory/inMemoryExports';
import { searchInMemoryPunchesByTagNo } from '../inMemory/inMemoryPunches';
import { Filter } from '../inMemory/searchFilter';
import { OfflineSystem } from '../offlineSync/offlineSystem';
import { punchesRepository } from '../offlineSync/punchSyncer/punchRepository';
import { punchesSyncSystem } from '../offlineSync/punchSyncer/punchSyncer';
import { ResultArray, ResultValue } from '../results/baseResult';
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
): Promise<ResultArray<PunchDto>> {
    return await _punchSearchSystem.search(
        async () => inMemory.Punches.search(searchText, maxHits, tryToApplyFilter),
        async () => []
    );
}

async function searchByTagNo(tagNo: string, tryToApplyFilter?: Filter<PunchDto>): Promise<ResultArray<PunchDto>> {
    return searchInMemoryPunchesByTagNo(tagNo, tryToApplyFilter);
}

export async function lookup(id: string): Promise<ResultValue<PunchDto>> {
    return await punchesRepository().get(id);
}

export async function lookupAll(ids: string[]): Promise<ResultArray<PunchDto>> {
    return await punchesRepository().bulkGet(ids);
}

export const externalPunches = {
    initTask,
    searchByTagNo,
    search,
    lookup,
    lookupAll
};
