import { McPackDb } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { OfflineSystem } from '../offlineSync/syncSettings';
import { InMemoryData } from './inMemoryData';
import { searchOrderedByBestMatch } from './inMemorySearch';

const inMemoryDbMcPacks: InMemoryData<McPackDb, number> = new InMemoryData<McPackDb, number>((item) => item.id);

export function inMemoryMcPacksInstance(): InMemoryData<McPackDb, number> {
    return inMemoryDbMcPacks;
}

export function searchInMemoryMcPacksWithText(
    searchText: string,
    maxHits: number,
    predicate?: (mcPack: McPackDb) => boolean
): McPackDb[] {
    return searchOrderedByBestMatch(
        inMemoryMcPacksInstance().all(),
        (item) => [item.mcPkgNo, item.commPkgNo, item.description, item.projectName],
        searchText,
        maxHits,
        OfflineSystem.Punches,
        predicate
    );
}
