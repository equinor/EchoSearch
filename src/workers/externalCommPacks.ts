import { inMemoryCommPacksInstance } from '../inMemory/inMemoryCommPacks';
import { inMemory } from '../inMemory/inMemoryExports';
import { Filter } from '../inMemory/searchFilter';
import { CommPackDb, commPacksApi } from '../offlineSync/commPacksSyncer/commPacksApi';
import { commPacksSyncSystem } from '../offlineSync/commPacksSyncer/commPacksSyncer';
import { OfflineSystem } from '../offlineSync/offlineSystem';
import { ResultArray, ResultValue } from '../results/baseResult';
import { CommPackDto } from './dataTypes';
import { SearchSystem } from './searchSystem';

let _commPacksSearchSystem: SearchSystem<CommPackDb>;

async function initTask(): Promise<void> {
    const initCommTask = commPacksSyncSystem.initTask();

    _commPacksSearchSystem = new SearchSystem<CommPackDb>(OfflineSystem.CommPack, initCommTask, () =>
        inMemory.CommPacks.isReady()
    );

    return await initCommTask;
}
async function search(
    searchText: string,
    maxHits: number,
    tryToApplyFilter?: Filter<CommPackDto>
): Promise<ResultArray<CommPackDto>> {
    return await _commPacksSearchSystem.search(
        async () => inMemory.CommPacks.search(searchText, maxHits, tryToApplyFilter),
        async () => commPacksApi.search(searchText, maxHits, tryToApplyFilter?.projectName)
    );
}
async function lookup(id: number): Promise<ResultValue<CommPackDto>> {
    return inMemoryCommPacksInstance().get(id);
}

async function lookupAll(ids: number[]): Promise<ResultArray<CommPackDto>> {
    return inMemoryCommPacksInstance().getAll(ids);
}

export const externalCommPacks = {
    initTask,
    search,
    lookup,
    lookupAll
};
