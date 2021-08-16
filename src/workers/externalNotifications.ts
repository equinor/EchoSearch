import { NotificationDto, ResultValue, ResultValues } from '..';
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
): Promise<ResultValues<NotificationDto>> {
    return await _notificationsSearchSystem.search(
        async () => inMemory.Notifications.search(searchText, maxHits, tryToApplyFilter),
        async () => []
    );
}

async function lookup(id: string): Promise<ResultValue<NotificationDto>> {
    return inMemoryNotificationsInstance().get(id);
}

async function lookupAll(ids: string[]): Promise<ResultValues<NotificationDto>> {
    return inMemoryNotificationsInstance().getAll(ids);
}

async function searchByTagNos(tagNos: string[]): Promise<ResultValues<NotificationDto>> {
    return searchInMemoryNotificationsByTagNos(tagNos);
}

export const externalNotifications = {
    initTask,
    search,
    searchByTagNos,
    lookup,
    lookupAll
};
