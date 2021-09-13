import { OfflineSystem } from '../offlineSync/offlineSystem';
import { PunchDb } from '../offlineSync/punchSyncer/punchApi';
import { ResultArray } from '../results/baseResult';
import { resultArray } from '../results/createResult';
import { InMemoryData } from './inMemoryData';
import { searchOrderedByBestMatch } from './inMemorySearch';
import { Filter, filterArrayOnProps } from './searchFilter';

const inMemoryDbPunches: InMemoryData<PunchDb, number> = new InMemoryData<PunchDb, number>((item) => item.id);

export function inMemoryPunchesInstance(): InMemoryData<PunchDb, number> {
    return inMemoryDbPunches;
}

const all = () => inMemoryPunchesInstance().all();

export function searchInMemoryPunchesWithText(
    searchText: string,
    maxHits: number,
    filter?: Filter<PunchDb>,
    predicate?: (punch: PunchDb) => boolean
): PunchDb[] {
    return searchOrderedByBestMatch(
        all(),
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
        filter,
        predicate
    );
}

export function searchInMemoryPunchesByTagNo(tagNo: string, filter?: Filter<PunchDb>): ResultArray<PunchDb> {
    const punches = resultArray.successOrEmpty(all().filter((punch) => punch.tagNo === tagNo));
    return filter ? resultArray.successOrEmpty(filterArrayOnProps(punches.values, filter)) : punches;
}
