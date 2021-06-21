import { InternalSyncResult, result, Result } from '../baseResult';
import { logger } from '../logger';
import { SearchSystem } from '../workers/searchSystem';
import { GetSetting, isSyncEnabled, OfflineSystem, SaveSettings } from './syncSettings';
import { getMaxDate, minusOneDay } from './Utils/dateUtils';
import { asyncUsing } from './Utils/usingDisposable';

export function syncIsOutdated(date: Date): boolean {
    //TODO Ove Use this
    const currDate = new Date();
    const timeDiff = (currDate.valueOf() - date.valueOf()) / 1000;

    const tenMinutes = 60 * 10;
    return timeDiff > tenMinutes;
}

const log = logger('SyncRunner');

const currentlySyncing: OfflineSystem[] = [];
export async function runSync<T>(searchSystem: SearchSystem<T>): Promise<Result> {
    if (!isSyncEnabled(searchSystem.offlineSystemKey)) {
        const message = 'sync is not enabled for ' + searchSystem.offlineSystemKey;
        log.warn(message);
        return result.syncError(message);
    }

    if (isSyncing(searchSystem.offlineSystemKey)) {
        const message = 'Sync is already in progress ' + searchSystem.offlineSystemKey;
        log.warn(message);
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

function setIsSyncing(offlineSystemKey: OfflineSystem, syncEnabledState) {
    log.create(offlineSystemKey).info(`isSyncing`, syncEnabledState);
    if (syncEnabledState) {
        currentlySyncing.push(offlineSystemKey);
        return;
    }

    const index = currentlySyncing.indexOf(offlineSystemKey, 0);
    if (index > -1) {
        currentlySyncing.splice(index, 1);
    }
}

async function runSyncInternal<T>(searchSystem: SearchSystem<T>): Promise<Result> {
    const performance = log.create(searchSystem.offlineSystemKey).performance();

    const syncTime = new Date();
    const settings = GetSetting(searchSystem.offlineSystemKey);

    let result = {} as InternalSyncResult;
    const needFullSync = !settings.lastSyncedAtDate;

    result = needFullSync
        ? await searchSystem.runFullSync()
        : await searchSystem.runUpdateSync(settings.newestItemDate!);

    if (result.isSuccess) {
        updateLastSyncedDate(searchSystem.offlineSystemKey, syncTime, result.newestItemDate);
    }

    const tagSyncStatus = result.isSuccess ? `SUCCESS found(${result.itemsSyncedCount})` : 'Failed :(';
    performance.forceLog(` Sync ${tagSyncStatus}`);
    return { ...result };
}

function updateLastSyncedDate(offlineSystemKey: OfflineSystem, lastSyncedAtDate: Date, newestItemDate?: Date): void {
    const setting = GetSetting(offlineSystemKey);
    setting.lastSyncedAtDate = lastSyncedAtDate;

    if (newestItemDate) {
        setting.newestItemDate = newestItemDate;
    } else {
        const lastSyncedMinusOneDayBecauseOfServerTimezone = minusOneDay(lastSyncedAtDate);
        setting.newestItemDate = getMaxDate(setting.newestItemDate, lastSyncedMinusOneDayBecauseOfServerTimezone);
    }
    SaveSettings(setting);
}
