import { McPackDb } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { OfflineSystem } from '../offlineSync/syncSettings';
import { InMemoryData } from './inMemoryData';
import { searchOrderedByBestMatch } from './inMemorySearch';

//McPacks init
const inMemoryDbMcPacks: InMemoryData<McPackDb> = new InMemoryData<McPackDb>((item) => item.commPkgNo);

export function inMemoryMcPacksInstance(): InMemoryData<McPackDb> {
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
