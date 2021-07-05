import { InternalSyncResult } from '../../baseResult';
import { inMemoryMcPacksInstance } from '../../inMemory/inMemoryMcPacks';
import { logger } from '../../logger';
import { SyncSystem } from '../../workers/syncSystem';
import { getInstCode, OfflineSystem, setIsSyncEnabled } from '../syncSettings';
import { getMaxDateFunc } from '../Utils/dateUtils';
import { apiAllMcPacks, apiUpdatedMcPacks, McPackDb } from './mcPacksApi';
import { mcPacksAdministrator, mcPacksRepository } from './mcPacksRepository';

const log = logger('McPack.Sync');

export const mcPacksSyncSystem = new SyncSystem(
    OfflineSystem.McPack,
    inMemoryMcPacksInstance(),
    mcPacksAdministrator(),
    async (abortSignal) => syncFullMcPacks(abortSignal),
    async (lastChangedDate, abortSignal) => syncUpdateMcPacks(lastChangedDate, abortSignal)
);
export async function setMcPacksIsEnabled(isEnabled: boolean): Promise<void> {
    setIsSyncEnabled(OfflineSystem.McPack, isEnabled);

    if (!isEnabled) {
        mcPacksAdministrator().deleteAndRecreate(); //TODO part of searchSystem?
        inMemoryMcPacksInstance().clearData();
    }
}

async function syncFullMcPacks(abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const performanceLogger = log.performance();
    const data = await apiAllMcPacks(getInstCode(), abortSignal);
    performanceLogger.forceLogDelta('Api');

    inMemoryMcPacksInstance().clearAndInit(data);
    performanceLogger.forceLogDelta('clear and init inMemoryData');

    await mcPacksAdministrator().deleteAndRecreate();
    performanceLogger.forceLogDelta('deleteAndRecreate');

    await mcPacksRepository().addDataBulks(data, abortSignal);
    performanceLogger.forceLogDelta('addDataBulks ' + data.length);
    const newestItemDate = getNewestItemDate(data);
    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

async function syncUpdateMcPacks(lastChangedDate: Date, abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const performanceLogger = log.performance();
    const data = await apiUpdatedMcPacks(getInstCode(), lastChangedDate, abortSignal);
    performanceLogger.forceLogDelta('Api');

    inMemoryMcPacksInstance().updateItems(data);
    performanceLogger.forceLogDelta('Add to inMemory, total: ' + inMemoryMcPacksInstance().length());

    await mcPacksRepository().addDataBulks(data, abortSignal);
    performanceLogger.forceLogDelta('Add to Dexie');

    const newestItemDate = getNewestItemDate(data);

    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

function getNewestItemDate(data: McPackDb[]) {
    return getMaxDateFunc(data, (mcPack) => [mcPack.updatedAt]);
}
