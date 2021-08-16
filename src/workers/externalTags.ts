import { ResultValue, TagSummaryDto } from '..';
import { inMemory } from '../inMemory/inMemoryExports';
import { searchForClosestTagNo } from '../inMemory/inMemoryTagSearch';
import { initLevTrieFromInMemoryTags } from '../inMemory/inMemoryTagsInitializer';
import { loggerFactory } from '../logger';
import { OfflineSystem } from '../offlineSync/offlineSystem';
import { tagsRepository } from '../offlineSync/tagSyncer/tagRepository';
import { TagSummaryDb } from '../offlineSync/tagSyncer/tagSummaryDb';
import { tagsSyncSystem } from '../offlineSync/tagSyncer/tagSyncer';
import { ResultArray } from '../results/baseResult';
import { resultValue } from '../results/createResult';
import { SearchSystem } from './searchSystem';

let _tagSearchSystem: SearchSystem<TagSummaryDb>;

const log = loggerFactory.tags('external');

async function internalInitTags(): Promise<void> {
    const performanceLogger = log.performance('Init Tags');

    await tagsSyncSystem.initTask();
    await initLevTrieFromInMemoryTags();

    //const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
    //await wait(5000);

    performanceLogger.forceLogDelta('done');
}

async function initTagsTask(): Promise<void> {
    const task = internalInitTags();

    _tagSearchSystem = new SearchSystem<TagSummaryDb>(OfflineSystem.Tags, task, () => inMemory.Tags.isReady());

    return await task;
}

async function search(searchText: string, maxHits: number): Promise<ResultArray<TagSummaryDto>> {
    //test error throw new NetworkError({ message: 'test message', httpStatusCode: 500, url: 'https://', exception: {} });
    return await _tagSearchSystem.search(
        async () => inMemory.Tags.search(searchText, maxHits),
        async () => inMemory.Tags.searchOnline(searchText, maxHits)
    );
}
async function findClosestTagNo(tagNo: string): Promise<ResultValue<string>> {
    const possibleTag = searchForClosestTagNo(tagNo);
    return resultValue.successOrNotFound(possibleTag?.word ?? undefined);
}

async function lookup(tagNo: string): Promise<ResultValue<TagSummaryDto>> {
    return await tagsRepository().get(tagNo);
}

async function lookupAll(tagNos: string[]): Promise<ResultArray<TagSummaryDto>> {
    return await tagsRepository().bulkGet(tagNos);
}

export const externalTags = {
    initTagsTask,
    search,
    searchForClosestTagNo: findClosestTagNo,
    lookup,
    lookupAll
};
