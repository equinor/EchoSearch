import { SearchResult, SearchResults } from '..';
import { searchResult, searchResults } from '../inMemory/searchResult';
import { ChecklistDb, checklistsApi } from '../offlineSync/checklistsSyncer/checklistsApi';
import { checklistsSearchDb } from '../offlineSync/checklistsSyncer/checklistsRepository';
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
    //return await checklistsRepository().get(id);
    console.log('id', id);
    return searchResult.successOrNotFound<ChecklistDto>(undefined); //TODO Ove
}

async function lookupAll(ids: number[]): Promise<SearchResults<ChecklistDto>> {
    console.log('ids', ids);
    //return checklistsRepository().bulkGet(ids);
    return searchResults.successOrEmpty([]); //TODO Ove
}

export const externalChecklists = {
    initTask,
    search,
    lookup,
    lookupAll
};
