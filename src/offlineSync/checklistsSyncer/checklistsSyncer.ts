import { InternalSyncResult, SyncCanceledError } from '../../baseResult';
import { inMemoryChecklistsInstance } from '../../inMemory/inMemoryChecklists';
import { loggerFactory } from '../../logger';
import { SyncSystem } from '../../workers/syncSystem';
import { commPacksApi } from '../commPacksSyncer/commPacksApi';
import { getInstCode, OfflineSystem, Settings } from '../syncSettings';
import { getMaxDateFunc } from '../Utils/dateUtils';
import { ChecklistDb, checklistsApi } from './checklistsApi';
import { checklistsAdministrator, checklistsRepository } from './checklistsRepository';

const log = loggerFactory.checklists('Syncer');

export const checklistsSyncSystem = new SyncSystem(
    OfflineSystem.Checklist,
    inMemoryChecklistsInstance(),
    checklistsAdministrator(),
    async (abortSignal) => syncFullChecklists(abortSignal),
    async (lastChangedDate, abortSignal) => syncUpdateChecklists(lastChangedDate, abortSignal)
);
export async function setChecklistsIsEnabled(isEnabled: boolean): Promise<void> {
    Settings.setIsSyncEnabled(OfflineSystem.Checklist, isEnabled);

    if (!isEnabled) {
        checklistsAdministrator().deleteAndRecreate(); //TODO part of searchSystem?
        inMemoryChecklistsInstance().clearData();
    }
}

async function syncFullChecklists(abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const performanceLogger = log.performance();
    const data = await checklistsApi.all(getInstCode(), abortSignal);
    performanceLogger.forceLogDelta('Api ' + data.length);

    inMemoryChecklistsInstance().clearAndInit(data);
    performanceLogger.forceLogDelta('clear and init inMemoryData');

    await checklistsAdministrator().deleteAndRecreate();
    performanceLogger.forceLogDelta('deleteAndRecreate');

    await checklistsRepository().addDataBulks(data, abortSignal);
    performanceLogger.forceLogDelta('addDataBulks ' + data.length);
    const newestItemDate = getNewestItemDate(data);
    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

interface PlantDataResult {
    isSuccess: boolean;
    error: string | undefined;
}

async function syncFullChecklistsWithPagination(
    instCode: string,
    abortSignal: AbortSignal
): Promise<InternalSyncResult> {
    let result: InternalSyncResult = { isSuccess: true, itemsSyncedCount: 0, error: undefined };
    const tStart = performance.now();
    let checklistCount = 0;

    const commPackNos = await commPacksApi.allCommPackNos(instCode, abortSignal);
    if (abortSignal.aborted) throw new SyncCanceledError('Sync of checklist was canceled');

    const commPackNoStartsWith = Array.from(new Set(commPackNos.map((commPackNo) => commPackNo.slice(0, 2))));

    let parallelFetchPromise = api.getAllCheckListsDataByCommPackNoStartsWith(
        plantRequest.instCode,
        commPackNoStartsWith[0]
    );
    for (let pageIndex = 0; result.isSuccess && pageIndex < commPackNoStartsWith.length; pageIndex++) {
        const t0 = performance.now();
        const noStartsWith = commPackNoStartsWith[pageIndex];
        const currentFetchPromise = parallelFetchPromise;
        //start next fetch promise, without await to run in parallel as we put data into indexDb
        if (result.isSuccess && pageIndex + 1 < commPackNoStartsWith.length) {
            parallelFetchPromise = api.getAllCheckListsDataByCommPackNoStartsWith(
                plantRequest.instCode,
                commPackNoStartsWith[pageIndex + 1]
            );
        }
        //maybe it's not complete yet, so await it before putting it into indexDb
        const checklists = await currentFetchPromise;
        checklistCount += checklists.length;
        postNotificationPerformance(`Checklist fetch/got commPackNo (${noStartsWith}) found(${checklists.length})`, t0);
        const offlineWorkerMsg = ConvertToOfflineWorkerMsg(checklists, plantRequest);
        result = await addDataToIndexDb(offlineWorkerMsg);
    }

    postNotificationPerformance(`Checklist done found(${checklistCount})`, tStart);
    return result;
}

async function syncUpdateChecklists(lastChangedDate: Date, abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const performanceLogger = log.performance();
    const data = await checklistsApi.updated(getInstCode(), lastChangedDate, abortSignal);
    performanceLogger.forceLogDelta('Api ' + data.length);

    inMemoryChecklistsInstance().updateItems(data);
    performanceLogger.forceLogDelta('Add to inMemory, total: ' + inMemoryChecklistsInstance().length());

    await checklistsRepository().addDataBulks(data, abortSignal);
    performanceLogger.forceLogDelta('Add to Dexie');

    const newestItemDate = getNewestItemDate(data);

    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

function getNewestItemDate(data: ChecklistDb[]) {
    return getMaxDateFunc(data, (checklist) => [checklist.formUpdatedAt]);
}
