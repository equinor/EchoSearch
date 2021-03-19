import { logPerformance } from '../logger';
import { isFullSyncDone, OfflineSystem } from '../offlineSync/syncSettings';
import { tagsRepository } from '../offlineSync/tagSyncer/tagRepository';
import { clearAndInitInMemoryTags } from './inMemoryTags';
import { clearLevTrie, populateLevTrieWithTags } from './inMemoryTagSearch';

export async function initInMemoryTagsFromIndexDb(): Promise<number> {
    if (!isFullSyncDone(OfflineSystem.Tags)) {
        return 0;
    }
    const performanceLogger = logPerformance();
    const tags = await tagsRepository().slowlyGetAllData();
    performanceLogger.log(`Load all tags from indexDb (${tags.length})`);

    clearAndInitInMemoryTags(tags);
    clearLevTrie();
    populateLevTrieWithTags(tags.map((item) => item.tagNo));
    performanceLogger.log(`initInMemoryTagsFromIndexDb All DONE (${tags.length})`);
    return tags.length;
}
