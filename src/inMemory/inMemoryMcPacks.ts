import { logWarn } from '../logger';
import { McPackDb } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { mcPacksRepository } from '../offlineSync/mcPacksSyncer/mcPacksRepository';
import { isFullSyncDone, OfflineSystem } from '../offlineSync/syncSettings';
import { InMemoryData } from './inMemoryData';
import { searchOrderedByBestMatch } from './inMemorySearch';

//McPacks init
let inMemoryDbMcPacks: InMemoryData<McPackDb> = new InMemoryData<McPackDb>((item) => item.commPkgNo);

export function inMemoryMcPacksInstance(): InMemoryData<McPackDb> {
    return inMemoryDbMcPacks;
}

export async function inMemoryMcPacksInit(): Promise<number> {
    if (!isFullSyncDone(OfflineSystem.McPack)) {
        logWarn(`Full ${OfflineSystem.McPack} sync is not done, cannot init in memory`);
        return 0;
    }

    const data = await mcPacksRepository().slowlyGetAllData();
    if (data.length > 0) inMemoryDbMcPacks.clearAndInit(data);
    return data.length;
}

export function searchInMemoryMcPacksWithText(searchText: string, maxHits: number): McPackDb[] {
    return searchOrderedByBestMatch(
        inMemoryMcPacksInstance().all(),
        (item) => [item.mcPkgNo, item.commPkgNo, item.description, item.projectName],
        searchText,
        maxHits,
        OfflineSystem.Punches
    );
}
