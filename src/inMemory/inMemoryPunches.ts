import { logger } from '../logger';
import { PunchDb } from '../offlineSync/punchSyncer/punchApi';
import { punchesRepository } from '../offlineSync/punchSyncer/punchRepository';
import { isFullSyncDone, OfflineSystem } from '../offlineSync/syncSettings';
import { InMemoryData } from './inMemoryData';
import { searchOrderedByBestMatch } from './inMemorySearch';

const log = logger('InMemory.Punch');
const inMemoryDbPunches: InMemoryData<PunchDb> = new InMemoryData<PunchDb>((item) => item.commPkgNo);

export function inMemoryPunchesInstance(): InMemoryData<PunchDb> {
    return inMemoryDbPunches;
}

export async function inMemoryPunchesInit(): Promise<number> {
    if (!isFullSyncDone(OfflineSystem.Punches)) {
        log.warn(`Full sync is not done, cannot init in memory`);
        return 0;
    }

    const data = await punchesRepository().slowlyGetAllData();
    if (data.length > 0) inMemoryDbPunches.clearAndInit(data);
    return data.length;
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
