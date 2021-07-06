import { loggerTags } from '../logger';
import { isFullSyncDone, OfflineSystem } from '../offlineSync/syncSettings';
import { getInMemoryTagsSorted } from './inMemoryTags';
import { tagsLevTrie } from './inMemoryTagsLevTrie';

const log = loggerTags('LevTrie.Init');

export async function initLevTrieFromInMemoryTags(): Promise<number> {
    if (!isFullSyncDone(OfflineSystem.Tags)) {
        return 0;
    }
    const performanceLogger = log.performance();
    const tags = getInMemoryTagsSorted();
    tagsLevTrie.clearAll();
    tagsLevTrie.populateWithTags(tags.map((item) => item.tagNo));
    performanceLogger.log(`initInMemoryTagsFromIndexDb All DONE (${tags.length})`);
    return tags.length;
}
