import { InternalSyncResult } from '../../baseResult';
import { inMemoryNotificationsInstance } from '../../inMemory/inMemoryNotifications';
import { loggerFactory } from '../../logger';
import { SyncSystem } from '../../workers/syncSystem';
import { getInstCode, OfflineSystem } from '../syncSettings';
import { getMaxDateFunc, minusOneDay } from '../Utils/dateUtils';
import { apiAllNotifications, apiUpdatedNotifications, NotificationDb } from './notificationApi';
import { notificationsAdministrator, notificationsRepositoryTransaction } from './notificationRepository';

const log = loggerFactory.notifications('Syncer');

export const notificationsSyncSystem = new SyncSystem(
    OfflineSystem.Notifications,
    inMemoryNotificationsInstance(),
    notificationsAdministrator(),
    async (abortSignal) => syncFullNotifications(abortSignal),
    async (lastChangedDate, abortSignal) => syncUpdateNotifications(lastChangedDate, abortSignal)
);

async function syncFullNotifications(abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const performanceLogger = log.performance();
    const data = await apiAllNotifications(getInstCode(), abortSignal);
    performanceLogger.forceLogDelta(' Api ' + data.length);

    inMemoryNotificationsInstance().clearAndInit(data);
    performanceLogger.forceLogDelta('clear and init inMemoryData');

    await notificationsAdministrator().deleteAndRecreate();
    performanceLogger.forceLogDelta('deleteAndRecreate');

    await notificationsRepositoryTransaction().addDataBulks(data, abortSignal);
    performanceLogger.forceLogDelta('addDataBulks ' + data.length);
    const newestItemDate = getNewestItemDate(data);
    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

async function syncUpdateNotifications(lastChangedDate: Date, abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const performanceLogger = log.performance();
    const data = await apiUpdatedNotifications(
        getInstCode(),
        minusOneDay(lastChangedDate) ?? lastChangedDate,
        abortSignal
    );
    performanceLogger.forceLogDelta('Api ' + data.length);

    const closedNotificationNos = data.filter((notification) => notification.completedDateTime);

    inMemoryNotificationsInstance().updateItems(data);
    if (closedNotificationNos.length > 0) {
        log.debug('Delete closed inMemory notifications', closedNotificationNos.length);
        inMemoryNotificationsInstance().removeItems(closedNotificationNos);
    }
    performanceLogger.forceLogDelta('Updated inMemory, total: ' + inMemoryNotificationsInstance().length());

    const transaction = notificationsRepositoryTransaction();
    await transaction.addDataBulks(data, abortSignal);
    if (closedNotificationNos.length > 0) {
        await transaction.bulkDeleteData(closedNotificationNos.map((item) => item.maintenanceRecordId));
    }
    performanceLogger.forceLogDelta('Add/Delete to Dexie');

    const newestItemDate = getNewestItemDate(data);

    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

function getNewestItemDate(data: NotificationDb[]) {
    return getMaxDateFunc(data, (notification) => [notification.changedDateTime]);
}
