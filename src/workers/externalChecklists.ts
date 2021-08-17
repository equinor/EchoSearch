import { Dictionary } from 'lodash';
import { ChecklistDb, checklistsApi } from '../offlineSync/checklistsSyncer/checklistsApi';
import {
    checklistsRepository,
    checklistsSearchDb,
    getLocalProCoSysChecklistsGroupedByTagNo
} from '../offlineSync/checklistsSyncer/checklistsRepository';
import { checklistsSyncSystem } from '../offlineSync/checklistsSyncer/checklistsSyncer';
import { OfflineSystem } from '../offlineSync/offlineSystem';
import { getInstCode, Settings } from '../offlineSync/syncSettings';
import { ResultArray, ResultValue } from '../results/baseResult';
import { resultArray, resultValue } from '../results/createResult';
import { errorMessage } from '../results/errors';
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
): Promise<ResultArray<ChecklistDto>> {
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
async function lookup(id: number): Promise<ResultValue<ChecklistDto>> {
    return Settings.isFullSyncDone(checklistKey)
        ? await checklistsRepository().get(id)
        : resultValue.error(errorMessage.sync.syncNeededBeforeSearch(checklistKey));
}

async function lookupAll(ids: number[]): Promise<ResultArray<ChecklistDto>> {
    return Settings.isFullSyncDone(checklistKey)
        ? checklistsRepository().bulkGet(ids)
        : resultArray.error(errorMessage.sync.syncNeededBeforeSearch(checklistKey));
}

async function lookupGroupByTagNos(tagNos: string[]): Promise<ResultValue<Dictionary<ChecklistDb[]>>> {
    if (!Settings.isFullSyncDone(checklistKey)) {
        return resultValue.error(errorMessage.sync.syncNeededBeforeSearch(checklistKey));
    }

    const results = await getLocalProCoSysChecklistsGroupedByTagNo(tagNos);
    return resultValue.successOrNotFound(results);
}

export const externalChecklists = {
    initTask,
    search,
    lookup,
    lookupAll,
    lookupGroupByTagNos
};
