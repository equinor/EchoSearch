import { inMemoryCommPacksInstance } from '../../inMemory/inMemoryCommPacks';
import { loggerFactory } from '../../logger';
import { InternalSyncResult } from '../../results/baseResult';
import { SyncSystem } from '../../workers/syncSystem';
import { OfflineSystem } from '../offlineSystem';
import { getInstCode, Settings } from '../syncSettings';
import { getMaxDateFunc } from '../Utils/dateUtils';
import { CommPackDb, commPacksApi } from './commPacksApi';
import { commPacksAdministrator, commPacksRepository } from './commPacksRepository';

const log = loggerFactory.commPacks('Syncer');

export const commPacksSyncSystem = new SyncSystem(
    OfflineSystem.CommPack,
    inMemoryCommPacksInstance(),
    commPacksAdministrator(),
    async (abortSignal) => syncFullCommPacks(abortSignal),
    async (lastChangedDate, abortSignal) => syncUpdateCommPacks(lastChangedDate, abortSignal)
);
export async function setCommPacksIsEnabled(isEnabled: boolean): Promise<void> {
    Settings.setIsSyncEnabled(OfflineSystem.CommPack, isEnabled);

    if (!isEnabled) {
        commPacksAdministrator().deleteAndRecreate(); //TODO part of searchSystem?
        inMemoryCommPacksInstance().clearData();
    }
}

async function syncFullCommPacks(abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const performanceLogger = log.performance();
    const data = await commPacksApi.all(getInstCode(), abortSignal);
    performanceLogger.forceLogDelta('Api ' + data.length);

    inMemoryCommPacksInstance().clearAndInit(data);
    performanceLogger.forceLogDelta('clear and init inMemoryData');

    await commPacksAdministrator().deleteAndRecreate();
    performanceLogger.forceLogDelta('deleteAndRecreate');

    await commPacksRepository().addDataBulks(data, abortSignal);
    performanceLogger.forceLogDelta('addDataBulks ' + data.length);
    const newestItemDate = getNewestItemDate(data);
    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

async function syncUpdateCommPacks(lastChangedDate: Date, abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const performanceLogger = log.performance();
    const data = await commPacksApi.updated(getInstCode(), lastChangedDate, abortSignal);
    performanceLogger.forceLogDelta('Api ' + data.length);

    inMemoryCommPacksInstance().updateItems(data);
    performanceLogger.forceLogDelta('Add to inMemory, total: ' + inMemoryCommPacksInstance().length());

    await commPacksRepository().addDataBulks(data, abortSignal);
    performanceLogger.forceLogDelta('Add to Dexie');

    const newestItemDate = getNewestItemDate(data);

    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

function getNewestItemDate(data: CommPackDb[]) {
    return getMaxDateFunc(data, (commPack) => [commPack.updatedAt]);
}
