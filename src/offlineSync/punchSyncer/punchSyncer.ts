import { InternalSyncResult } from '../../baseResult';
import { inMemoryPunchesInstance } from '../../inMemory/inMemoryPunches';
import { logger } from '../../logger';
import { Repository } from '../offlineDataDexieBase';
import { getInstCode, GetSetting, OfflineSystem, setIsSyncEnabled } from '../syncSettings';
import { dateDifferenceInDays, getMaxDateFunc } from '../Utils/dateUtils';
import { apiAllPunches, apiUpdatedPunches, PunchDb, verifyPunchCount } from './punchApi';
import { punchesAdministrator, punchesRepository } from './punchRepository';

const log = logger('Punch.Sync');

export async function setPunchesIsEnabled(isEnabled: boolean): Promise<void> {
    setIsSyncEnabled(OfflineSystem.Punches, isEnabled);

    if (!isEnabled) {
        punchesAdministrator().deleteAndRecreate(); //TODO part of searchSystem?
        inMemoryPunchesInstance().clearData();
    }
}

export async function syncFullPunches(abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const performanceLogger = log.performance();
    const data = await apiAllPunches(getInstCode(), abortSignal);
    performanceLogger.forceLogDelta(' Api');

    inMemoryPunchesInstance().clearAndInit(data);
    performanceLogger.forceLogDelta(' clear and init inMemoryData');

    await punchesAdministrator().deleteAndRecreate();
    performanceLogger.forceLogDelta(' deleteAndRecreate');

    await punchesRepository().addDataBulks(data, abortSignal);
    performanceLogger.forceLogDelta(' addDataBulks ' + data.length);

    const newestItemDate = getNewestItemDate(data);
    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

export async function syncUpdatePunches(newestItemDate: Date, abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const lastSyncedAtDate = GetSetting(OfflineSystem.Punches).lastSyncedAtDate;
    const daysSinceLastUpdate = dateDifferenceInDays(new Date(), lastSyncedAtDate);
    const daysBackInTime = 2;
    if (daysSinceLastUpdate >= daysBackInTime) {
        console.log('------ running full punch sync');
        return await syncFullPunches(abortSignal);
    }

    const performanceLogger = log.performance();
    const punches = await apiUpdatedPunches(getInstCode(), newestItemDate, abortSignal);
    performanceLogger.forceLogDelta('Api');
    inMemoryPunchesInstance().updateItems(punches);

    const repository = punchesRepository();
    await repository.addDataBulks(punches, abortSignal);
    await deleteClosedPunches(punches, repository);

    if (!(await verifyPunchCount(getInstCode(), inMemoryPunchesInstance().length(), abortSignal))) {
        return syncFullPunches(abortSignal);
    }

    return { isSuccess: true, itemsSyncedCount: punches.length, newestItemDate: getNewestItemDate(punches) };
}

async function deleteClosedPunches(punches: PunchDb[], repository: Repository<PunchDb>): Promise<void> {
    inMemoryPunchesInstance().removeItems(punches);

    const closedPunchesNos = punches.filter((punch) => punch.clearedAt || punch.rejectedAt).map((item) => item.id);
    if (closedPunchesNos.length > 0) {
        log.info('-- Delete closed punches', closedPunchesNos.length);
        await repository.bulkDeleteData(closedPunchesNos);
    }
}

function getNewestItemDate(data: PunchDb[]): Date | undefined {
    return getMaxDateFunc(data, (punch) => [punch.updatedAt, punch.rejectedAt, punch.clearedAt, punch.createdAt]);
}
