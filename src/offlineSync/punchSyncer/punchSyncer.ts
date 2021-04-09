import { logPerformance } from '../../logger';
import { InternalSyncResult } from '../syncResult';
import { getInstCode, OfflineSystem, setIsSyncEnabled } from '../syncSettings';
import { getMaxDateFunc } from '../Utils/dateUtils';
import { apiAllPunches, apiUpdatedPunches, PunchDb } from './punchApi';
import { punchesAdministrator, punchesRepository } from './punchRepository';

export async function setPunchesIsEnabled(isEnabled: boolean): Promise<void> {
    setIsSyncEnabled(OfflineSystem.Punches, isEnabled);

    if (!isEnabled) {
        punchesAdministrator().deleteAndRecreate(); //TODO part of searchSystem?
        //inMemoryPunchesInstance().clearData();
    }
}

export async function syncFullPunches(): Promise<InternalSyncResult> {
    const performanceLogger = logPerformance();
    const data = await apiAllPunches(getInstCode());
    performanceLogger.forceLogDelta('Punches Api');

    //inMemoryPunchesInstance().clearAndInit(data);
    performanceLogger.forceLogDelta('Punches clear and init inMemoryData');

    await punchesAdministrator().deleteAndRecreate();
    performanceLogger.forceLogDelta('Punches deleteAndRecreate');

    await punchesRepository().addDataBulks(data);
    performanceLogger.forceLogDelta('Punches addDataBulks ' + data.length);
    const newestItemDate = getNewestItemDate(data);
    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

export async function syncUpdatePunches(lastChangedDate: Date): Promise<InternalSyncResult> {
    const performanceLogger = logPerformance();
    const punches = await apiUpdatedPunches(getInstCode(), lastChangedDate);
    performanceLogger.forceLogDelta('Punches Api');

    //inMemoryPunchesInstance().updateData(data);
    //performanceLogger.forceLogDelta('Punches Add to inMemory, total: ' + inMemoryPunchesInstance().length());

    await punchesRepository().addDataBulks(punches);
    performanceLogger.forceLogDelta('Punches Add to Dexie');

    const newestItemDate = getNewestItemDate(punches);
    return { isSuccess: true, itemsSyncedCount: punches.length, newestItemDate };
}

function getNewestItemDate(data: PunchDb[]): Date | undefined {
    return getMaxDateFunc(data, (punch) => [punch.updatedAt, punch.rejectedAt, punch.clearedAt, punch.createdAt]);
}
