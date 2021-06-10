import { createError, createNotImplementedError, NotImplementedError, Result } from '../baseResult';
import {
    inMemoryMcPacksInit,
    inMemoryMcPacksInstance,
    searchInMemoryMcPacksWithText
} from '../inMemory/inMemoryMcPacks';
import {
    inMemoryPunchesInit,
    inMemoryPunchesInstance,
    searchInMemoryPunchesWithText
} from '../inMemory/inMemoryPunches';
import { clearInMemoryTags, isInMemoryTagsReady } from '../inMemory/inMemoryTags';
import { clearLevTrie, searchForClosestTagNo, searchTags } from '../inMemory/inMemoryTagSearch';
import { initInMemoryTagsFromIndexDb } from '../inMemory/inMemoryTagsInitializer';
import { createSearchSuccess, createSearchSuccesses, SearchResult, SearchResults } from '../inMemory/searchResult';
import { logPerformance } from '../logger';
import { McPackDb, mcPacksMock } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { mcPacksAdministrator, mcPacksRepository } from '../offlineSync/mcPacksSyncer/mcPacksRepository';
import { setMcPacksIsEnabled, syncFullMcPacks, syncUpdateMcPacks } from '../offlineSync/mcPacksSyncer/mcPacksSyncer';
import { PunchDb, punchesMock } from '../offlineSync/punchSyncer/punchApi';
import { punchesAdministrator, punchesRepository } from '../offlineSync/punchSyncer/punchRepository';
import { setPunchesIsEnabled, syncFullPunches, syncUpdatePunches } from '../offlineSync/punchSyncer/punchSyncer';
import { runSync } from '../offlineSync/syncRunner';
import { CreateDefaultSettings, loadOfflineSettings, OfflineSystem, SaveSettings } from '../offlineSync/syncSettings';
import { searchTagsOnline, tagsMock } from '../offlineSync/tagSyncer/tagApi';
import { tagsAdministrator, tagsRepository } from '../offlineSync/tagSyncer/tagRepository';
import { TagSummaryDb } from '../offlineSync/tagSyncer/tagSummaryDb';
import { syncFullTags, syncUpdateTags } from '../offlineSync/tagSyncer/tagSyncer';
import { setToken } from '../tokenHelper';
import { SearchSystem } from './searchSystem';

let _counter = 0;
function functionShouldOnlyBeCalledOnce(): void {
    console.error('--called once only?? no :( counter should increase if its same instance of file..', _counter++);
}

functionShouldOnlyBeCalledOnce();

let initDone = false;
let mcPacksSystem: SearchSystem<McPackDb>;
let tagSearchSystem: SearchSystem<TagSummaryDb>;
let punchSearchSystem: SearchSystem<PunchDb>;

export async function externalInitialize(): Promise<void> {
    console.log('-------------- externalInitialize ------------ ');
    // const wait = (ms) => new Promise((res) => setTimeout(res, ms));
    // const p1 = new Promise((res) => setTimeout(() => res('p1'), 1000));
    // const p2 = new Promise((res) => setTimeout(() => res('p2'), 500));
    // const result = await Promise.race([p1, p2]);

    await internalInitialize();
}

async function initMcPacks(): Promise<void> {
    const performanceLogger = logPerformance('Init McPacks');
    await mcPacksAdministrator().init();
    const mcPackCount = await inMemoryMcPacksInit();
    performanceLogger.forceLogDelta('McPacks done ' + mcPackCount);
}

async function initPunches(): Promise<void> {
    const performanceLogger = logPerformance('Init Punches');
    await punchesAdministrator().init();
    const mcPackCount = await inMemoryPunchesInit();
    performanceLogger.forceLogDelta('Punches done ' + mcPackCount);
}

async function initTags(): Promise<void> {
    const performanceLogger = logPerformance('Init Tags');
    await tagsAdministrator().init();
    const tagCount = await initInMemoryTagsFromIndexDb();

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));
    await wait(5000);

    performanceLogger.forceLogDelta('Tags done ' + tagCount);
}

async function internalInitialize(): Promise<void> {
    externalToggleMockData();
    if (initDone) {
        console.warn('internalInitialize already done, returning');
        return;
    }

    const performanceLogger = logPerformance('InternalInitialize ');

    await loadOfflineSettings();
    performanceLogger.forceLogDelta('Loaded Offline Settings 11');

    const initMcTask = initMcPacks();
    const initTagsTask = initTags();
    const initPunchesTask = initPunches();

    performanceLogger.forceLog('SearchSystems starting');

    mcPacksSystem = new SearchSystem<McPackDb>(
        OfflineSystem.McPack,
        initMcTask,
        () => inMemoryMcPacksInstance().isReady(),
        async (searchText, maxHits) => searchInMemoryMcPacksWithText(searchText, maxHits),
        async (searchText, maxHits) => searchMcPacksOnline(searchText, maxHits),
        async () => syncFullMcPacks(),
        async (lastChangedDate) => syncUpdateMcPacks(lastChangedDate)
    );

    tagSearchSystem = new SearchSystem<TagSummaryDb>(
        OfflineSystem.Tags,
        initTagsTask,
        () => isInMemoryTagsReady(),
        async (searchText, maxHits) => searchTags(searchText, maxHits),
        async (searchText, maxHits) => searchTagsOnline(searchText, maxHits),
        async () => syncFullTags(),
        async (lastChangedDate) => syncUpdateTags(lastChangedDate)
    );

    punchSearchSystem = new SearchSystem<PunchDb>(
        OfflineSystem.Punches,
        initPunchesTask,
        () => isInMemoryTagsReady(),
        async (searchText, maxHits) => searchInMemoryPunchesWithText(searchText, maxHits),
        async () => [],
        //async (searchText, maxHits) => [], //searchTagsOnline(searchText, maxHits),
        async () => syncFullPunches(),
        async (lastChangedDate) => syncUpdatePunches(lastChangedDate)
    );

    performanceLogger.forceLog('SearchSystems instantiated');

    // await initMcTask;
    // await initTagsTask;
    await Promise.all([initMcTask, initPunchesTask, initTagsTask]);
    performanceLogger.log('DONE');

    //Keep for performance testing when we have more items to sync.
    // const tagsTask = initInMemoryTagsFromIndexDb();
    // const mcPacksTask = inMemoryMcPacksInit();
    // const result = await Promise.all([tagsTask, mcPacksTask]);
    // console.log('done loading', result);

    performanceLogger.forceLog('Search module initialize done');
    initDone = true;
}

export async function externalTagSearch(searchText: string, maxHits: number): Promise<SearchResults<TagSummaryDb>> {
    const results = await tagSearchSystem.search(searchText, maxHits);
    return results;
}

export async function externalLookupTag(tagNo: string): Promise<SearchResult<TagSummaryDb>> {
    const result = await tagsRepository().get(tagNo);
    return createSearchSuccess(result);
}

export async function externalLookupTags(tagNos: string[]): Promise<SearchResults<TagSummaryDb>> {
    const result = await tagsRepository().bulkGet(tagNos);
    return createSearchSuccesses(result);
}

export async function externalMcPackSearch(searchText: string, maxHits: number): Promise<SearchResults<McPackDb>> {
    // if (mcPacksSearcher === undefined) {
    //     return [];
    // }
    const results = await mcPacksSystem.search(searchText, maxHits);
    return results;
}
export async function externalLookupMcPack(id: string): Promise<SearchResult<McPackDb>> {
    const result = await mcPacksRepository().get(id);
    return createSearchSuccess(result);
}

export async function externalLookupMcPacks(ids: string[]): Promise<SearchResults<McPackDb>> {
    const result = await mcPacksRepository().bulkGet(ids);
    return createSearchSuccesses(result);
}

export async function externalPunchesSearch(searchText: string, maxHits: number): Promise<SearchResults<PunchDb>> {
    const results = await punchSearchSystem.search(searchText, maxHits);
    return results;
}

export async function externalLookupPunch(id: string): Promise<SearchResult<PunchDb>> {
    const result = await punchesRepository().get(id);
    return createSearchSuccess(result);
}

export async function externalLookupPunches(ids: string[]): Promise<SearchResults<PunchDb>> {
    const result = await punchesRepository().bulkGet(ids);
    return createSearchSuccesses(result);
}

async function searchMcPacksOnline(searchText: string, maxHits: number): Promise<McPackDb[]> {
    return [
        {
            commPkgNo: '1',
            description: 'McPacks online Search',
            mcPkgNo: searchText,
            projectName: maxHits.toString(),
            id: 5,
            updatedAt: new Date()
        } as McPackDb
    ];
}

export async function externalSearchForClosestTagNo(tagNo: string): Promise<string | undefined> {
    const possibleTag = searchForClosestTagNo(tagNo);
    return possibleTag ? possibleTag.word : undefined;
}

async function externalRunSync(offlineSystemKey: OfflineSystem, apiAccessToken: string): Promise<Result> {
    try {
        setToken(apiAccessToken);
        if (offlineSystemKey === OfflineSystem.McPack) {
            return await runSync(mcPacksSystem);
        } else if (offlineSystemKey === OfflineSystem.Tags) {
            return await runSync(tagSearchSystem);
        } else if (offlineSystemKey === OfflineSystem.Punches) {
            return await runSync(punchSearchSystem);
        }

        return createNotImplementedError('sync has not been implemented for ' + offlineSystemKey);
    } catch (e) {
        console.log('--error caught', e);
        return createError(e);
    }
}

// function getSearchSystem<T>(offlineSystemKey: OfflineSystem) : SearchSystem<T> {
//     if (offlineSystemKey === OfflineSystem.McPack) {
//         return mcPacksSystem as SearchSystem<T>;

//     } else if (offlineSystemKey === OfflineSystem.Tags) {
//          return tagSearchSystem;
//     }
//     // } else if (offlineSystemKey === OfflineSystem.Punches) {
//     //     return punchSearchSystem;
//     // }
//     throw new NotImplementedError('getSearchSystem has not been implemented for ', offlineSystemKey);
// }

async function externalSetEnabled(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<void> {
    if (offlineSystemKey === OfflineSystem.McPack) {
        setMcPacksIsEnabled(isEnabled);
    } else if (offlineSystemKey === OfflineSystem.Punches) {
        setPunchesIsEnabled(isEnabled);
    }
}

function externalCancelSync(offlineSystemKey: OfflineSystem): void {
    if (offlineSystemKey === OfflineSystem.McPack) mcPacksRepository().cancelSync();
    else throw new NotImplementedError('cancel not implemented for ' + offlineSystemKey);
}

async function externalDeleteAllData(): Promise<void> {
    ClearSettings(OfflineSystem.Tags);
    await tagsAdministrator().deleteAndRecreate();
    clearInMemoryTags();
    clearLevTrie();

    ClearSettings(OfflineSystem.McPack);
    await mcPacksAdministrator().deleteAndRecreate();
    inMemoryMcPacksInstance().clearData();

    ClearSettings(OfflineSystem.Punches);
    await punchesAdministrator().deleteAndRecreate();
    inMemoryPunchesInstance().clearData();
}

function ClearSettings(offlineSystemKey: OfflineSystem): void {
    const settings = CreateDefaultSettings(offlineSystemKey);
    SaveSettings(settings);
}

function externalToggleMockData(): void {
    mcPacksMock.toggle();
    punchesMock.toggle();
    tagsMock.toggle();
    console.log(
        'use mock tags:',
        tagsMock.isEnabled,
        'mcPacks',
        mcPacksMock.isEnabled,
        'punches',
        punchesMock.isEnabled
    );
}

export const syncContract = {
    externalDeleteAllData,
    externalCancelSync,
    externalSetEnabled,
    externalRunSync,
    externalToggleMockData
};
