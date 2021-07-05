import { InternalSyncResult } from '../../baseResult';
import { inMemoryNotificationsInstance } from '../../inMemory/inMemoryNotifications';
//import { inMemoryNotificationsInstance } from '../../inMemory/inMemoryNotifications';
import { logger } from '../../logger';
import { SyncSystem } from '../../workers/syncSystem';
import { getInstCode, OfflineSystem } from '../syncSettings';
import { getMaxDateFunc } from '../Utils/dateUtils';
import { apiAllNotifications, apiUpdatedNotifications, NotificationDb } from './notificationApi';
import { notificationsAdministrator, notificationsRepository } from './notificationRepository';

const log = logger('Notification.Sync');

export const notificationsSyncSystem = new SyncSystem(
    OfflineSystem.Notifications,
    inMemoryNotificationsInstance(),
    notificationsAdministrator(),
    async (abortSignal) => syncFullNotifications(abortSignal),
    async (lastChangedDate, abortSignal) => syncUpdateNotifications(lastChangedDate, abortSignal)
);

export async function syncFullNotifications(abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const performanceLogger = log.performance();
    const data = await apiAllNotifications(getInstCode(), abortSignal);
    performanceLogger.forceLogDelta('Api');

    inMemoryNotificationsInstance().clearAndInit(data);
    performanceLogger.forceLogDelta('clear and init inMemoryData');

    await notificationsAdministrator().deleteAndRecreate();
    performanceLogger.forceLogDelta('deleteAndRecreate');

    await notificationsRepository().addDataBulks(data, abortSignal);
    performanceLogger.forceLogDelta('addDataBulks ' + data.length);
    const newestItemDate = getNewestItemDate(data);
    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

export async function syncUpdateNotifications(
    lastChangedDate: Date,
    abortSignal: AbortSignal
): Promise<InternalSyncResult> {
    const performanceLogger = log.performance();
    const data = await apiUpdatedNotifications(getInstCode(), lastChangedDate, abortSignal);
    performanceLogger.forceLogDelta('Api');

    inMemoryNotificationsInstance().updateItems(data);
    performanceLogger.forceLogDelta('Add to inMemory, total: ' + inMemoryNotificationsInstance().length());

    await notificationsRepository().addDataBulks(data, abortSignal);
    performanceLogger.forceLogDelta('Add to Dexie');

    const newestItemDate = getNewestItemDate(data);

    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

function getNewestItemDate(data: NotificationDb[]) {
    return getMaxDateFunc(data, (notification) => [notification.changedDateTime]);
}
