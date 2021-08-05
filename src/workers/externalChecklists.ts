import { SearchResult, SearchResults } from '..';
import { searchResult, searchResults } from '../inMemory/searchResult';
import { checklistsSyncSystem } from '../offlineSync/checklistsSyncer/checklistsSyncer';
import { ChecklistDto } from './dataTypes';

// let _checklistsSearchSystem: SearchSystem<ChecklistDb>;

async function initTask(): Promise<void> {
    const initChecklistTask = checklistsSyncSystem.initTask();

    // _checklistsSearchSystem = new SearchSystem<ChecklistDb>(OfflineSystem.Checklist, initChecklistTask, () =>
    //     inMemory.Checklists.isReady()
    // );

    return await initChecklistTask;
}
// async function search(
//     searchText: string,
//     maxHits: number,
//     tryToApplyFilter?: Filter<ChecklistDto>
// ): Promise<SearchResults<ChecklistDto>> {
//     // return await _checklistsSearchSystem.search(
//     //     async () => [], //inMemory.Checklists.search(searchText, maxHits, tryToApplyFilter),
//     //     async () => [] //checklistsApi.search(searchText, maxHits, tryToApplyFilter?.projectName)
//     // );
//     return searchResults.successOrEmpty([]);
// }
async function lookup(id: number): Promise<SearchResult<ChecklistDto>> {
    //return await checklistsRepository().get(id);
    console.log('id', id);
    return searchResult.successOrNotFound<ChecklistDto>(undefined);
}

async function lookupAll(ids: number[]): Promise<SearchResults<ChecklistDto>> {
    console.log('ids', ids);
    //return checklistsRepository().bulkGet(ids);
    return searchResults.successOrEmpty([]);
}

export const externalChecklists = {
    initTask,
    //search,
    lookup,
    lookupAll
};
