import { inMemoryMcPacksInstance } from '../../inMemory/inMemoryMcPacks';
import { logPerformance } from '../../logger';
import { InternalSyncResult } from '../syncResult';
import { instCode, OfflineSystem, setIsSyncEnabled } from '../syncSettings';
import { apiAllMcPacks, apiUpdatedMcPacks } from './mcPacksApi';
import { mcPacksAdministrator, mcPacksRepository } from './mcPacksRepository';

export async function setMcPacksIsEnabled(isEnabled: boolean): Promise<void> {
    setIsSyncEnabled(OfflineSystem.McPk, isEnabled);

    if (!isEnabled) {
        mcPacksAdministrator().deleteAndRecreate(); //TODO part of searchSystem?
        inMemoryMcPacksInstance().clearData();
    }
}

export async function syncFullMcPacks(): Promise<InternalSyncResult> {
    const performanceLogger = logPerformance();
    const data = await apiAllMcPacks(instCode());
    performanceLogger.forceLogDelta('McPacks Api');

    inMemoryMcPacksInstance().clearAndInit(data);
    performanceLogger.forceLogDelta('McPacks clear and init inMemoryData');

    await mcPacksAdministrator().deleteAndRecreate();
    performanceLogger.forceLogDelta('McPacks deleteAndRecreate');

    await mcPacksRepository().addDataBulks(data);
    performanceLogger.forceLogDelta('McPacks addDataBulks ' + data.length);
    return { isSuccess: true, itemsSyncedCount: data.length } as InternalSyncResult;
}

export async function syncUpdateMcPacks(lastChangedDate: Date): Promise<InternalSyncResult> {
    const performanceLogger = logPerformance();
    const data = await apiUpdatedMcPacks(instCode(), lastChangedDate);
    performanceLogger.forceLogDelta('McPacks Api');

    inMemoryMcPacksInstance().updateData(data);
    performanceLogger.forceLogDelta('McPacks Add to inMemory, total: ' + inMemoryMcPacksInstance().length());

    await mcPacksRepository().addDataBulks(data);
    performanceLogger.forceLogDelta('McPacks Add to Dexie');

    return { isSuccess: true, itemsSyncedCount: data.length } as InternalSyncResult;
}
