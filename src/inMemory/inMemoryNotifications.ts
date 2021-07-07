import { NotificationDb } from '../offlineSync/notificationSyncer/notificationApi';
import { OfflineSystem } from '../offlineSync/syncSettings';
import { InMemoryData } from './inMemoryData';
import { searchOrderedByBestMatch } from './inMemorySearch';

//Notifications init
const inMemoryDbNotifications: InMemoryData<NotificationDb> = new InMemoryData<NotificationDb>(
    (item) => item.maintenanceRecordId
);

export function inMemoryNotificationsInstance(): InMemoryData<NotificationDb> {
    return inMemoryDbNotifications;
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
