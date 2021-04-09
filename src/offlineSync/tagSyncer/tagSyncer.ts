import { clearAndInitInMemoryTags, updateInMemoryTags } from '../../inMemory/inMemoryTags';
import { populateLevTrieWithTags } from '../../inMemory/inMemoryTagSearch';
import { InternalSyncResult } from '../syncResult';
import { getMaxDateFunc } from '../Utils/dateUtils';
import { apiAllTags, apiUpdatedTags } from './tagApi';
import { tagsAdministrator, tagsRepository } from './tagRepository';
import { TagSummaryDb } from './tagSummaryDb';

export async function syncFullTags(): Promise<InternalSyncResult> {
    const data = await apiAllTags();
    await tagsAdministrator().deleteAndRecreate();
    await tagsRepository().addDataBulks(data.tags);
    clearAndInitInMemoryTags(data.tags); //we are dependent on summary from indexDb, so have to sync in memory after indexDb is done :(
    populateLevTrieWithTags(data.tags.map((item) => item.tagNo));
    return { isSuccess: true, newestItemDate: data.dataSyncedAt, itemsSyncedCount: data.tags.length };
}

export async function syncUpdateTags(lastChangedDate: Date): Promise<InternalSyncResult> {
    const data = await apiUpdatedTags(lastChangedDate);
    await tagsRepository().addDataBulks(data.tags);
    updateInMemoryTags(data.tags);
    populateLevTrieWithTags(data.tags.map((item) => item.tagNo));
    const newestItemDate = getNewestItemDate(data.tags);
    return { isSuccess: true, newestItemDate, itemsSyncedCount: data.tags.length }; //TODO Ove remove result, throw exception?
}

function getNewestItemDate(data: TagSummaryDb[]): Date | undefined {
    return getMaxDateFunc(data, (tag) => [tag.updatedDate]);
}
