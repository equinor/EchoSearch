import { searchTagsOnline } from '../offlineSync/tagSyncer/tagApi';
import { inMemoryMcPacksInstance, searchInMemoryMcPacksWithText } from './inMemoryMcPacks';
import { inMemoryNotificationsInstance, searchInMemoryNotificationsWithText } from './inMemoryNotifications';
import { inMemoryPunchesInstance, searchInMemoryPunchesWithText } from './inMemoryPunches';
import { isInMemoryTagsReady } from './inMemoryTags';
import { searchTags } from './inMemoryTagSearch';

const Notifications = {
    isReady: (): boolean => inMemoryNotificationsInstance().isReady(),
    search: searchInMemoryNotificationsWithText
};

const Punches = {
    isReady: (): boolean => inMemoryPunchesInstance().isReady(),
    search: searchInMemoryPunchesWithText
};

const McPacks = {
    isReady: (): boolean => inMemoryMcPacksInstance().isReady(),
    search: searchInMemoryMcPacksWithText
};

const Tags = {
    isReady: isInMemoryTagsReady,
    search: searchTags,
    searchOnline: searchTagsOnline
};

export const inMemory = {
    McPacks,
    Notifications,
    Punches,
    Tags
};
