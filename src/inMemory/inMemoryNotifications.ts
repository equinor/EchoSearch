import { OfflineSystem } from '../offlineSync/offlineSystem';
import { ResultArray } from '../results/baseResult';
import { resultArray } from '../results/createResult';
import { NotificationDto } from '../workers/dataTypes';
import { InMemoryData } from './inMemoryData';
import { searchOrderedByBestMatch } from './inMemorySearch';
import { Filter } from './searchFilter';

//Notifications init
const inMemoryDbNotifications: InMemoryData<NotificationDto, string> = new InMemoryData<NotificationDto, string>(
    (item) => item.maintenanceRecordId
);

export function inMemoryNotificationsInstance(): InMemoryData<NotificationDto, string> {
    return inMemoryDbNotifications;
}

const all = () => inMemoryNotificationsInstance().all();

export function searchInMemoryNotificationsWithText(
    searchText: string,
    maxHits: number,
    filter?: Filter<NotificationDto>,
    predicate?: (notification: NotificationDto) => boolean
): NotificationDto[] {
    return searchOrderedByBestMatch(
        all(),
        (item) => [
            item.maintenanceRecordId.toString(),
            item.functionalLocation,
            item.title,
            item.tagId ?? '',
            item.mainWorkCenterId,
            item.equipmentId
        ],
        searchText,
        maxHits,
        OfflineSystem.Notifications,
        filter,
        predicate
    );
}

export function searchInMemoryNotificationsByTagNos(tagNos: string[]): ResultArray<NotificationDto> {
    return resultArray.successOrEmpty(all().filter((n) => n.tagId && tagNos.indexOf(n.tagId) >= 0));
}
