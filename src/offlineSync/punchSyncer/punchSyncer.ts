import { logInfo, logPerformance } from '../../logger';
import { InternalSyncResult } from '../syncResult';
import { getInstCode, GetSetting, OfflineSystem, setIsSyncEnabled } from '../syncSettings';
import { dateDifferenceInDays, getMaxDateFunc } from '../Utils/dateUtils';
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

export async function syncUpdatePunches(newestItemDate: Date): Promise<InternalSyncResult> {
    const lastSyncedAtDate = GetSetting(OfflineSystem.Punches).lastSyncedAtDate;
    const daysSinceLastUpdate = dateDifferenceInDays(new Date(), lastSyncedAtDate);
    const daysBackInTime = 2;
    if (daysSinceLastUpdate >= daysBackInTime) {
        console.log('------ running full punch sync');
        return await syncFullPunches();
    }

    const performanceLogger = logPerformance();
    const punches = await apiUpdatedPunches(getInstCode(), newestItemDate);
    performanceLogger.forceLogDelta('Punches Api');

    //inMemoryPunchesInstance().updateData(data);
    //performanceLogger.forceLogDelta('Punches Add to inMemory, total: ' + inMemoryPunchesInstance().length());

    const repository = punchesRepository();
    await repository.addDataBulks(punches);
    performanceLogger.forceLogDelta('Punches Add to Dexie');

    const closedPunchesNos = punches.filter((punch) => punch.clearedAt || punch.rejectedAt).map((item) => item.id);
    if (closedPunchesNos.length > 0) {
        logInfo('-- Delete closed punches', closedPunchesNos.length);
        await repository.bulkDeleteData(closedPunchesNos);
    }

    return { isSuccess: true, itemsSyncedCount: punches.length, newestItemDate: getNewestItemDate(punches) };
}

function getNewestItemDate(data: PunchDb[]): Date | undefined {
    return getMaxDateFunc(data, (punch) => [punch.updatedAt, punch.rejectedAt, punch.clearedAt, punch.createdAt]);
}
