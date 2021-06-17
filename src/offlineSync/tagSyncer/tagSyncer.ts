import { InternalSyncResult } from '../../baseResult';
import {
    clearAndInitInMemoryTags,
    inMemoryTagsCount as inMemoryTagCount,
    updateInMemoryTags
} from '../../inMemory/inMemoryTags';
import { populateLevTrieWithTags } from '../../inMemory/inMemoryTagSearch';
import { getMaxDateFunc } from '../Utils/dateUtils';
import { apiAllTags, apiUpdatedTags } from './tagApi';
import { tagsAdministrator, tagsRepository } from './tagRepository';
import { TagSummaryDb } from './tagSummaryDb';

export async function syncFullTags(abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const data = await apiAllTags(abortSignal);
    await tagsAdministrator().deleteAndRecreate();
    await tagsRepository().addDataBulks(data.tags, abortSignal); //TODO test exception and error handling inside addDataBulks
    clearAndInitInMemoryTags(data.tags); //we are dependent on summary from indexDb, so have to sync in memory after indexDb is done :(
    populateLevTrieWithTags(data.tags.map((item) => item.tagNo));

    const updateSyncResult = await syncUpdateTags(data.dataSyncedAt, abortSignal);
    if (updateSyncResult.isSuccess) {
        return { ...updateSyncResult, itemsSyncedCount: inMemoryTagCount() };
    }

    return { isSuccess: true, newestItemDate: data.dataSyncedAt, itemsSyncedCount: inMemoryTagCount() }; //full sync was successful
}

export async function syncUpdateTags(lastChangedDate: Date, abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const data = await apiUpdatedTags(lastChangedDate, abortSignal);
    await tagsRepository().addDataBulks(data.tags, abortSignal);
    updateInMemoryTags(data.tags);
    populateLevTrieWithTags(data.tags.map((item) => item.tagNo));
    const newestItemDate = getNewestItemDate(data.tags);
    return { isSuccess: true, newestItemDate, itemsSyncedCount: data.tags.length }; //TODO Ove remove result, throw exception?
}

function getNewestItemDate(data: TagSummaryDb[]): Date | undefined {
    return getMaxDateFunc(data, (tag) => [tag.updatedDate]);
}
