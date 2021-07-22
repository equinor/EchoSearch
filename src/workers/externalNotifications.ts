import { NotificationDto, SearchResult, SearchResults } from '..';
import { inMemory } from '../inMemory/inMemoryExports';
import { inMemoryNotificationsInstance, searchInMemoryNotificationsByTagNos } from '../inMemory/inMemoryNotifications';
import { Filter } from '../inMemory/searchFilter';
import { notificationsSyncSystem } from '../offlineSync/notificationSyncer/notificationSyncer';
import { OfflineSystem } from '../offlineSync/syncSettings';
import { SearchSystem } from './searchSystem';

let _notificationsSearchSystem: SearchSystem<NotificationDto>;

async function initTask(): Promise<void> {
    const initNotificationTask = notificationsSyncSystem.initTask();

    _notificationsSearchSystem = new SearchSystem<NotificationDto>(
        OfflineSystem.Notifications,
        initNotificationTask,
        () => inMemory.Notifications.isReady()
    );
    await initNotificationTask;
}

async function search(
    searchText: string,
    maxHits: number,
    tryToApplyFilter?: Filter<NotificationDto>
): Promise<SearchResults<NotificationDto>> {
    return await _notificationsSearchSystem.search(
        async () => inMemory.Notifications.search(searchText, maxHits, tryToApplyFilter),
        async () => []
    );
}

async function lookup(id: string): Promise<SearchResult<NotificationDto>> {
    return inMemoryNotificationsInstance().get(id);
}

async function lookupAll(ids: string[]): Promise<SearchResults<NotificationDto>> {
    return inMemoryNotificationsInstance().getAll(ids);
}

async function searchByTagNos(tagNos: string[]): Promise<SearchResults<NotificationDto>> {
    return searchInMemoryNotificationsByTagNos(tagNos);
}

export const externalNotifications = {
    initTask,
    search,
    searchByTagNos,
    lookup,
    lookupAll
};
