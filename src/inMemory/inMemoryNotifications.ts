import { logger } from '../logger';
import { NotificationDb } from '../offlineSync/notificationSyncer/notificationApi';
import { notificationsRepository } from '../offlineSync/notificationSyncer/notificationRepository';
import { isFullSyncDone, OfflineSystem } from '../offlineSync/syncSettings';
import { InMemoryData } from './inMemoryData';
import { searchOrderedByBestMatch } from './inMemorySearch';

const log = logger('InMemory.Notifications');
//Notifications init
const inMemoryDbNotifications: InMemoryData<NotificationDb> = new InMemoryData<NotificationDb>(
    (item) => item.maintenanceRecordId
);

export function inMemoryNotificationsInstance(): InMemoryData<NotificationDb> {
    return inMemoryDbNotifications;
}

export async function inMemoryNotificationsInit(): Promise<number> {
    if (!isFullSyncDone(OfflineSystem.Notifications)) {
        log.warn(`Full ${OfflineSystem.Notifications} sync is not done, cannot init in memory`);
        return 0;
    }

    const data = await notificationsRepository().slowlyGetAllData();
    if (data.length > 0) inMemoryDbNotifications.clearAndInit(data);
    return data.length;
}

export function searchInMemoryNotificationsWithText(
    searchText: string,
    maxHits: number,
    predicate?: (notification: NotificationDb) => boolean
): NotificationDb[] {
    return searchOrderedByBestMatch(
        inMemoryNotificationsInstance().all(),
        (item) => [
            item.maintenanceRecordId.toString(),
            item.functionalLocation,
            item.title,
            item.mainWorkCenterId,
            item.equipmentId
        ],
        searchText,
        maxHits,
        OfflineSystem.Punches,
        predicate
    );
}
