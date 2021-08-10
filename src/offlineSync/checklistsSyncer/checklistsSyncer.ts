import { InternalSyncResult } from '../../baseResult';
import { loggerFactory } from '../../logger';
import { SyncSystem } from '../../workers/syncSystem';
import { commPacksApi } from '../commPacksSyncer/commPacksApi';
import { getInstCode, OfflineSystem, Settings } from '../syncSettings';
import { getMaxDateFunc, minusOneDay } from '../Utils/dateUtils';
import { ChecklistDb, checklistsApi } from './checklistsApi';
import { checklistsAdministrator, checklistsRepository } from './checklistsRepository';

const log = loggerFactory.checklists('Syncer');

export const checklistsSyncSystem = new SyncSystem(
    OfflineSystem.Checklist,
    undefined,
    checklistsAdministrator(),
    async (abortSignal) => syncFullChecklistsWithPagination(abortSignal),
    async (lastChangedDate, abortSignal) => syncUpdateChecklists(lastChangedDate, abortSignal)
);
export async function setChecklistsIsEnabled(isEnabled: boolean): Promise<void> {
    Settings.setIsSyncEnabled(OfflineSystem.Checklist, isEnabled);

    if (!isEnabled) {
        checklistsAdministrator().deleteAndRecreate();
    }
}

let resumableCommPackNos: string[] = [] as string[]; //TODO clear on syncEnabled is set to false
let resumableFullSyncStartedAt = new Date();

async function getCommPackNoStartsWith(instCode: string, abortSignal: AbortSignal): Promise<string[]> {
    if (checklistsApi.state.isMockEnabled) {
        return ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];
    }
    const commPackNos = await commPacksApi.allCommPackNos(instCode, abortSignal);
    return Array.from(new Set(commPackNos.map((commPackNo) => commPackNo.slice(0, 2))));
}

async function syncFullChecklistsWithPagination(abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const instCode = getInstCode();
    let checklistCount = 0;
    const performance = log.performance();

    let commPackNoStartsWith = [...resumableCommPackNos];
    if (resumableCommPackNos.length === 0) {
        resumableFullSyncStartedAt = new Date();
        commPackNoStartsWith = await getCommPackNoStartsWith(instCode, abortSignal);
        resumableCommPackNos = [...commPackNoStartsWith];
    }
    log.trace('resumableCommPackNos start', resumableCommPackNos);

    const repository = checklistsRepository();
    let parallelFetchPromise = checklistsApi.allBy(instCode, commPackNoStartsWith[0], abortSignal);

    for (let pageIndex = 0; pageIndex < commPackNoStartsWith.length; pageIndex++) {
        const currentFetchPromise = parallelFetchPromise;

        //start next fetch promise, without await to run in parallel as we put data into indexDb
        if (pageIndex + 1 < commPackNoStartsWith.length) {
            parallelFetchPromise = checklistsApi.allBy(instCode, commPackNoStartsWith[pageIndex + 1], abortSignal);
        }

        //maybe it's not complete yet, so await it before putting it into indexDb
        const checklists = await currentFetchPromise;
        checklistCount += checklists.length;
        const noStartsWith = commPackNoStartsWith[pageIndex];
        performance.logDelta(`Checklist fetch/got commPackNo (${noStartsWith}) found(${checklists.length})`);

        await repository.addDataBulks(checklists, abortSignal);
        resumableCommPackNos = resumableCommPackNos.filter((item) => item !== noStartsWith);
        log.trace('resumableCommPackNos', resumableCommPackNos);
    }

    performance.log(`Checklist done found(${checklistCount})`);
    return {
        isSuccess: true,
        itemsSyncedCount: checklistCount,
        newestItemDate: minusOneDay(resumableFullSyncStartedAt)
    };
}

async function syncUpdateChecklists(lastChangedDate: Date, abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const performanceLogger = log.performance();
    const data = await checklistsApi.updated(getInstCode(), lastChangedDate, abortSignal);
    performanceLogger.forceLogDelta('Api ' + data.length);

    await checklistsRepository().addDataBulks(data, abortSignal);
    performanceLogger.forceLogDelta('Add to Dexie');

    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate: getNewestOrYesterday(data) };
}

function getNewestOrYesterday(data: ChecklistDb[]) {
    const date = getMaxDateFunc(data, (checklist) => [checklist.formUpdatedAt]);
    return date ?? minusOneDay(date);
}
