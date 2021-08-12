import { Dictionary } from 'lodash';
import { SearchResult, SearchResults } from '..';
import { searchResult, searchResults } from '../inMemory/searchResult';
import { ChecklistDb, checklistsApi } from '../offlineSync/checklistsSyncer/checklistsApi';
import {
    checklistsRepository,
    checklistsSearchDb,
    getLocalProCoSysChecklistsGroupedByTagNo
} from '../offlineSync/checklistsSyncer/checklistsRepository';
import { checklistsSyncSystem } from '../offlineSync/checklistsSyncer/checklistsSyncer';
import { getInstCode, OfflineSystem, Settings } from '../offlineSync/syncSettings';
import { ChecklistDto } from './dataTypes';
import { SearchSystem } from './searchSystem';

let _checklistsSearchSystem: SearchSystem<ChecklistDb>;
const checklistKey = OfflineSystem.Checklist;

async function initTask(): Promise<void> {
    const initChecklistTask = checklistsSyncSystem.initTask();

    _checklistsSearchSystem = new SearchSystem<ChecklistDb>(checklistKey, initChecklistTask, () =>
        Settings.isFullSyncDone(checklistKey)
    );

    return await initChecklistTask;
}

async function search(
    tagNo?: string,
    commPackNo?: string,
    mcPackNo?: string,
    tagProjectName?: string,
    maxHits = 500
): Promise<SearchResults<ChecklistDto>> {
    return await _checklistsSearchSystem.search(
        async () => await checklistsSearchDb(tagNo, commPackNo, mcPackNo, tagProjectName, maxHits),
        async () =>
            checklistsApi.search(
                getInstCode(),
                { tagNo, commPackNo, mcPackNo, projectCode: tagProjectName },
                undefined,
                maxHits
            )
    );
}
async function lookup(id: number): Promise<SearchResult<ChecklistDto>> {
    return Settings.isFullSyncDone(checklistKey)
        ? await checklistsRepository().get(id)
        : searchResult.syncNotEnabledError(checklistKey);
}

async function lookupAll(ids: number[]): Promise<SearchResults<ChecklistDto>> {
    return Settings.isFullSyncDone(checklistKey)
        ? checklistsRepository().bulkGet(ids)
        : searchResults.syncNotEnabledError(checklistKey);
}

async function lookupGroupByTagNos(tagNos: string[]): Promise<SearchResult<Dictionary<ChecklistDb[]>>> {
    if (!Settings.isFullSyncDone(checklistKey)) {
        return searchResult.syncNotEnabledError(checklistKey);
    }

    const results = await getLocalProCoSysChecklistsGroupedByTagNo(tagNos);
    return searchResult.successOrNotFound(results);
}

export const externalChecklists = {
    initTask,
    search,
    lookup,
    lookupAll,
    lookupGroupByTagNos
};
