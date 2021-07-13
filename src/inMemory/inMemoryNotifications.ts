import { NotificationDto } from '..';
import { OfflineSystem } from '../offlineSync/syncSettings';
import { InMemoryData } from './inMemoryData';
import { searchOrderedByBestMatch } from './inMemorySearch';
import { SearchResults, searchResults } from './searchResult';

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
    predicate?: (notification: NotificationDto) => boolean
): NotificationDto[] {
    return searchOrderedByBestMatch(
        all(),
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

export function searchInMemoryNotificationsByTagNos(tagNos: string[]): SearchResults<NotificationDto> {
    return searchResults.successOrEmpty(all().filter((n) => n.tagId && tagNos.indexOf(n.tagId) >= 0));
}
