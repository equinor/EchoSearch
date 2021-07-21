import { CommPackDb } from '../offlineSync/commPacksSyncer/commPacksApi';
import { OfflineSystem } from '../offlineSync/syncSettings';
import { InMemoryData } from './inMemoryData';
import { searchOrderedByBestMatch } from './inMemorySearch';

const inMemoryDbCommPacks: InMemoryData<CommPackDb, number> = new InMemoryData<CommPackDb, number>((item) => item.id);

export function inMemoryCommPacksInstance(): InMemoryData<CommPackDb, number> {
    return inMemoryDbCommPacks;
}

export function searchInMemoryCommPacksWithText(
    searchText: string,
    maxHits: number,
    predicate?: (commPack: CommPackDb) => boolean
): CommPackDb[] {
    return searchOrderedByBestMatch(
        inMemoryCommPacksInstance().all(),
        (item) => [item.commPkgNo, item.id.toString(), item.description, item.projectName],
        searchText,
        maxHits,
        OfflineSystem.Punches,
        predicate
    );
}
