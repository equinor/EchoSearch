import { McPackDto, SearchResult, SearchResults } from '..';
import { inMemory } from '../inMemory/inMemoryExports';
import { inMemoryMcPacksInstance } from '../inMemory/inMemoryMcPacks';
import { McPackDb, mcPacksApi } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { mcPacksSyncSystem } from '../offlineSync/mcPacksSyncer/mcPacksSyncer';
import { OfflineSystem } from '../offlineSync/syncSettings';
import { SearchSystem } from './searchSystem';

let _mcPacksSearchSystem: SearchSystem<McPackDb>;

async function initTask(): Promise<void> {
    const initMcTask = mcPacksSyncSystem.initTask();

    _mcPacksSearchSystem = new SearchSystem<McPackDb>(
        OfflineSystem.McPack,
        initMcTask,
        () => inMemory.McPacks.isReady(),
        async (searchText, maxHits) => inMemory.McPacks.search(searchText, maxHits),
        async (searchText, maxHits) => mcPacksApi.search(searchText, maxHits)
    );

    return await initMcTask;
}

async function search(searchText: string, maxHits: number): Promise<SearchResults<McPackDto>> {
    return await _mcPacksSearchSystem.search(searchText, maxHits);
}
async function lookup(id: number): Promise<SearchResult<McPackDto>> {
    return inMemoryMcPacksInstance().get(id);
}

async function lookupAll(ids: number[]): Promise<SearchResults<McPackDto>> {
    return inMemoryMcPacksInstance().getAll(ids);
}

export const externalMcPacks = {
    initTask,
    search,
    lookup,
    lookupAll
};
