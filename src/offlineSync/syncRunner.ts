import { loggerFactory, LoggerFunctions } from '../logger';
import { NotInitializedError, Result } from '../results/baseResult';
import { result } from '../results/createResult2';
import { SyncSystem } from '../workers/syncSystem';
import { OfflineSystem, Settings } from './syncSettings';
import { getMaxDate, minusOneDay } from './Utils/dateUtils';
import { asyncUsing } from './Utils/usingDisposable';

function logCreate(offlineSystemKey: OfflineSystem): LoggerFunctions {
    return loggerFactory.default(offlineSystemKey + '.SyncRunner');
}
const currentlySyncing: OfflineSystem[] = [];

export async function runSync<T>(searchSystem: SyncSystem<T>): Promise<Result> {
    if (!Settings.isSyncEnabled(searchSystem.offlineSystemKey)) {
        const message = 'sync is not enabled for ' + searchSystem.offlineSystemKey;
        logCreate(searchSystem.offlineSystemKey).warn(message);
        return result.syncError(message);
    }

    if (isSyncing(searchSystem.offlineSystemKey)) {
        const message = 'Sync is already in progress ' + searchSystem.offlineSystemKey;
        logCreate(searchSystem.offlineSystemKey).warn(message);
        return result.syncError(message);
    }

    return await asyncUsing(
        async () => {
            setIsSyncing(searchSystem.offlineSystemKey, true);
            return await runSyncInternal(searchSystem);
        },
        () => setIsSyncing(searchSystem.offlineSystemKey, false)
    );
}

function isSyncing(offlineSystemKey: OfflineSystem): boolean {
    return currentlySyncing.includes(offlineSystemKey);
}

function setIsSyncing(offlineSystemKey: OfflineSystem, syncEnabledState: boolean) {
    logCreate(offlineSystemKey).info(`isSyncing`, syncEnabledState);
    if (syncEnabledState) {
        currentlySyncing.push(offlineSystemKey);
        return;
    }

    const index = currentlySyncing.indexOf(offlineSystemKey, 0);
    if (index > -1) {
        currentlySyncing.splice(index, 1);
    }
}

async function runSyncInternal<T>(searchSystem: SyncSystem<T>): Promise<Result> {
    const performance = logCreate(searchSystem.offlineSystemKey).performance();

    const syncDateTime = new Date();
    const settings = Settings.get(searchSystem.offlineSystemKey);

    const needFullSync = !settings.lastSyncedAtDate;
    logCreate(searchSystem.offlineSystemKey).trace('Need full sync:', needFullSync);

    const result = needFullSync
        ? await searchSystem.runFullSync()
        : await searchSystem.runUpdateSync(getDateOrThrow(settings.newestItemDate, searchSystem.offlineSystemKey));

    if (result.isSuccess) {
        updateLastSyncedDate(searchSystem.offlineSystemKey, syncDateTime, result.newestItemDate);
    }

    const syncStatus = result.isSuccess ? `SUCCESS found(${result.itemsSyncedCount})` : 'Failed :(';
    performance.forceLog(` Sync ${syncStatus}`);
    return { ...result };
}

function getDateOrThrow(date: Date | undefined, offlineSystemKey: OfflineSystem): Date {
    if (!date)
        throw new NotInitializedError(
            `runSyncInternal.runUpdateSync ${offlineSystemKey}: date cannot be null - bug in code`
        );
    return date;
}

function updateLastSyncedDate(offlineSystemKey: OfflineSystem, lastSyncedAtDate: Date, newestItemDate?: Date): void {
    const setting = { ...Settings.get(offlineSystemKey) };
    setting.lastSyncedAtDate = lastSyncedAtDate;

    if (newestItemDate) {
        setting.newestItemDate = newestItemDate;
    } else {
        const lastSyncedMinusOneDayBecauseOfServerTimezone = minusOneDay(lastSyncedAtDate);
        setting.newestItemDate = getMaxDate(setting.newestItemDate, lastSyncedMinusOneDayBecauseOfServerTimezone);
    }
    Settings.save(setting);
}
