import { CommPackDto, SearchResult, SearchResults } from '..';
import { inMemoryCommPacksInstance } from '../inMemory/inMemoryCommPacks';
import { inMemory } from '../inMemory/inMemoryExports';
import { CommPackDb, commPacksApi } from '../offlineSync/commPacksSyncer/commPacksApi';
import { commPacksSyncSystem } from '../offlineSync/commPacksSyncer/commPacksSyncer';
import { OfflineSystem } from '../offlineSync/syncSettings';
import { SearchSystem } from './searchSystem';

let _commPacksSearchSystem: SearchSystem<CommPackDb>;

async function initTask(): Promise<void> {
    const initCommTask = commPacksSyncSystem.initTask();

    _commPacksSearchSystem = new SearchSystem<CommPackDb>(
        OfflineSystem.CommPack,
        initCommTask,
        () => inMemory.CommPacks.isReady(),
        async (searchText, maxHits) => inMemory.CommPacks.search(searchText, maxHits),
        async (searchText, maxHits) => commPacksApi.search(searchText, maxHits)
    );

    return await initCommTask;
}
async function search(searchText: string, maxHits: number): Promise<SearchResults<CommPackDto>> {
    return await _commPacksSearchSystem.search(searchText, maxHits);
}
async function lookup(id: number): Promise<SearchResult<CommPackDto>> {
    return inMemoryCommPacksInstance().get(id);
}

async function lookupAll(ids: number[]): Promise<SearchResults<CommPackDto>> {
    return inMemoryCommPacksInstance().getAll(ids);
}

export const externalCommPacks = {
    initTask,
    search,
    lookup,
    lookupAll
};
