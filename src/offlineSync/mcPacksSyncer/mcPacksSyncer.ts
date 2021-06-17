import { InternalSyncResult } from '../../baseResult';
import { inMemoryMcPacksInstance } from '../../inMemory/inMemoryMcPacks';
import { logPerformance } from '../../logger';
import { getInstCode, OfflineSystem, setIsSyncEnabled } from '../syncSettings';
import { getMaxDateFunc } from '../Utils/dateUtils';
import { apiAllMcPacks, apiUpdatedMcPacks, McPackDb } from './mcPacksApi';
import { mcPacksAdministrator, mcPacksRepository } from './mcPacksRepository';

export async function setMcPacksIsEnabled(isEnabled: boolean): Promise<void> {
    setIsSyncEnabled(OfflineSystem.McPack, isEnabled);

    if (!isEnabled) {
        mcPacksAdministrator().deleteAndRecreate(); //TODO part of searchSystem?
        inMemoryMcPacksInstance().clearData();
    }
}

export async function syncFullMcPacks(): Promise<InternalSyncResult> {
    const performanceLogger = logPerformance();
    const data = await apiAllMcPacks(getInstCode());
    performanceLogger.forceLogDelta('McPacks Api');

    inMemoryMcPacksInstance().clearAndInit(data);
    performanceLogger.forceLogDelta('McPacks clear and init inMemoryData');

    await mcPacksAdministrator().deleteAndRecreate();
    performanceLogger.forceLogDelta('McPacks deleteAndRecreate');

    await mcPacksRepository().addDataBulks(data);
    performanceLogger.forceLogDelta('McPacks addDataBulks ' + data.length);
    const newestItemDate = getNewestItemDate(data);
    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

export async function syncUpdateMcPacks(lastChangedDate: Date): Promise<InternalSyncResult> {
    const performanceLogger = logPerformance();
    const data = await apiUpdatedMcPacks(getInstCode(), lastChangedDate);
    performanceLogger.forceLogDelta('McPacks Api');

    inMemoryMcPacksInstance().updateItems(data);
    performanceLogger.forceLogDelta('McPacks Add to inMemory, total: ' + inMemoryMcPacksInstance().length());

    await mcPacksRepository().addDataBulks(data);
    performanceLogger.forceLogDelta('McPacks Add to Dexie');

    const newestItemDate = getNewestItemDate(data);

    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

function getNewestItemDate(data: McPackDb[]) {
    return getMaxDateFunc(data, (mcPack) => [mcPack.updatedAt]);
}
