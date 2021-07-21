import { searchTagsOnline } from '../offlineSync/tagSyncer/tagApi';
import { inMemoryCommPacksInstance, searchInMemoryCommPacksWithText } from './inMemoryCommPacks';
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

const CommPacks = {
    isReady: (): boolean => inMemoryCommPacksInstance().isReady(),
    search: searchInMemoryCommPacksWithText
};

const Tags = {
    isReady: isInMemoryTagsReady,
    search: searchTags,
    searchOnline: searchTagsOnline
};

export const inMemory = {
    McPacks,
    CommPacks,
    Notifications,
    Punches,
    Tags
};
