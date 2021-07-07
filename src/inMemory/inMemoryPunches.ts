import { PunchDb } from '../offlineSync/punchSyncer/punchApi';
import { OfflineSystem } from '../offlineSync/syncSettings';
import { InMemoryData } from './inMemoryData';
import { searchOrderedByBestMatch } from './inMemorySearch';

const inMemoryDbPunches: InMemoryData<PunchDb> = new InMemoryData<PunchDb>((item) => item.commPkgNo);

export function inMemoryPunchesInstance(): InMemoryData<PunchDb> {
    return inMemoryDbPunches;
}

export function searchInMemoryPunchesWithText(
    searchText: string,
    maxHits: number,
    predicate?: (punch: PunchDb) => boolean
): PunchDb[] {
    return searchOrderedByBestMatch(
        inMemoryPunchesInstance().all(),
        (item) => [
            item.id.toString(),
            item.tagNo,
            item.mcPkgNo,
            item.commPkgNo,
            item.description,
            item.clearedByOrg,
            item.raisedByOrg,
            item.tagDescription
        ],
        searchText,
        maxHits,
        OfflineSystem.Punches,
        predicate
    );
}
