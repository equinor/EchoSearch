import { clearAndInitInMemoryTags, updateInMemoryTags } from '../../inMemory/inMemoryTags';
import { populateLevTrieWithTags } from '../../inMemory/inMemoryTagSearch';
import { InternalSyncResult } from '../syncResult';
import { apiAllTags, apiUpdatedTags } from './tagApi';
import { tagsAdministrator, tagsRepository } from './tagRepository';

export async function syncFullTags(): Promise<InternalSyncResult> {
    const data = await apiAllTags();
    await tagsAdministrator().deleteAndRecreate();
    await tagsRepository().addDataBulks(data.tags);
    clearAndInitInMemoryTags(data.tags); //we are dependent on summary from indexDb, so have to sync in memory after indexDb is done :(
    populateLevTrieWithTags(data.tags.map((item) => item.tagNo));
    return { isSuccess: true, dataSyncedAtDate: data.dataSyncedAt, itemsSyncedCount: data.tags.length };
}

export async function syncUpdateTags(lastChangedDate: Date): Promise<InternalSyncResult> {
    const data = await apiUpdatedTags(lastChangedDate);
    await tagsRepository().addDataBulks(data.tags);
    updateInMemoryTags(data.tags);
    populateLevTrieWithTags(data.tags.map((item) => item.tagNo));
    return { isSuccess: true, dataSyncedAtDate: data.dataSyncedAt, itemsSyncedCount: data.tags.length }; //TODO Ove remove result, throw exception?
}
