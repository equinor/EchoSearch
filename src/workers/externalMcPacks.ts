import { McPackDto, ResultValue, ResultValues } from '..';
import { inMemory } from '../inMemory/inMemoryExports';
import { inMemoryMcPacksInstance } from '../inMemory/inMemoryMcPacks';
import { Filter } from '../inMemory/searchFilter';
import { McPackDb, mcPacksApi } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { mcPacksSyncSystem } from '../offlineSync/mcPacksSyncer/mcPacksSyncer';
import { OfflineSystem } from '../offlineSync/offlineSystem';
import { resultArray, resultValue } from '../results/createResult';
import { SearchSystem } from './searchSystem';

let _mcPacksSearchSystem: SearchSystem<McPackDb>;
const _key = OfflineSystem.McPack;

async function initTask(): Promise<void> {
    const initMcTask = mcPacksSyncSystem.initTask();

    _mcPacksSearchSystem = new SearchSystem<McPackDb>(_key, initMcTask, () => inMemory.McPacks.isReady());

    return await initMcTask;
}

async function search(
    searchText: string,
    maxHits: number,
    tryToApplyFilter?: Filter<McPackDb>
): Promise<ResultValues<McPackDto>> {
    return await _mcPacksSearchSystem.search(
        async () => inMemory.McPacks.search(searchText, maxHits, tryToApplyFilter),
        () => mcPacksApi.search(searchText, maxHits, undefined, tryToApplyFilter?.projectName)
    );
}
async function lookup(id: number): Promise<ResultValue<McPackDto>> {
    return inMemory.McPacks.isReady() ? inMemoryMcPacksInstance().get(id) : resultValue.syncNotEnabledError(_key); //TODO Error this is syncNotReady error
}

async function lookupAll(ids: number[]): Promise<ResultValues<McPackDto>> {
    return inMemory.McPacks.isReady() ? inMemoryMcPacksInstance().getAll(ids) : resultArray.syncNotEnabledError(_key);
}

export const externalMcPacks = {
    initTask,
    search,
    lookup,
    lookupAll
};
