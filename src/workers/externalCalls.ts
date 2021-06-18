import { NotFoundError } from '@equinor/echo-base';
import { NotImplementedError, result, Result } from '../baseResult';
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
import { searchResult, SearchResult, searchResults, SearchResults } from '../inMemory/searchResult';
import { createLogger } from '../logger';
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

const logger = createLogger('externalCalls');

let _counter = 0;
function functionShouldOnlyBeCalledOnce(): void {
    logger.error('--called once only?? no :( counter should increase if its same instance of file..', _counter++);
}

functionShouldOnlyBeCalledOnce();

let initDone = false;
let mcPacksSystem: SearchSystem<McPackDb>;
let tagSearchSystem: SearchSystem<TagSummaryDb>;
let punchSearchSystem: SearchSystem<PunchDb>;

export async function externalInitialize(): Promise<void> {
    logger.info('-------------- externalInitialize ------------ ');
    // const wait = (ms) => new Promise((res) => setTimeout(res, ms));
    // const p1 = new Promise((res) => setTimeout(() => res('p1'), 1000));
    // const p2 = new Promise((res) => setTimeout(() => res('p2'), 500));
    // const result = await Promise.race([p1, p2]);

    await internalInitialize();
}

async function initMcPacks(): Promise<void> {
    const performanceLogger = logger.performance('Init McPacks');
    await mcPacksAdministrator().init();
    const mcPackCount = await inMemoryMcPacksInit();
    performanceLogger.forceLogDelta('done ' + mcPackCount);
}

async function initPunches(): Promise<void> {
    const performanceLogger = logger.performance('Init Punches');
    await punchesAdministrator().init();
    const mcPackCount = await inMemoryPunchesInit();
    performanceLogger.forceLogDelta('done ' + mcPackCount);
}

async function initTags(): Promise<void> {
    const performanceLogger = logger.performance('Init Tags');
    await tagsAdministrator().init();
    const tagCount = await initInMemoryTagsFromIndexDb();

    const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
    await wait(5000);

    performanceLogger.forceLogDelta('done ' + tagCount);
}

async function internalInitialize(): Promise<void> {
    logger.create('child').info('-- this is from the new logger 222');

    externalToggleMockData();
    if (initDone) {
        logger.warn('internalInitialize already done, returning');
        return;
    }

    const performanceLogger = logger.performance();

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
        async (abortSignal) => syncFullMcPacks(abortSignal),
        async (lastChangedDate, abortSignal) => syncUpdateMcPacks(lastChangedDate, abortSignal)
    );

    tagSearchSystem = new SearchSystem<TagSummaryDb>(
        OfflineSystem.Tags,
        initTagsTask,
        () => isInMemoryTagsReady(),
        async (searchText, maxHits) => searchTags(searchText, maxHits),
        async (searchText, maxHits) => searchTagsOnline(searchText, maxHits),
        async (abortSignal) => syncFullTags(abortSignal),
        async (lastChangedDate, abortSignal) => syncUpdateTags(lastChangedDate, abortSignal)
    );

    punchSearchSystem = new SearchSystem<PunchDb>(
        OfflineSystem.Punches,
        initPunchesTask,
        () => isInMemoryTagsReady(),
        async (searchText, maxHits) => searchInMemoryPunchesWithText(searchText, maxHits),
        async () => [],
        //async (searchText, maxHits) => [], //searchTagsOnline(searchText, maxHits),
        async (abortSignal) => syncFullPunches(abortSignal),
        async (lastChangedDate, abortSignal) => syncUpdatePunches(lastChangedDate, abortSignal)
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
    //test error throw new NetworkError({ message: 'test message', httpStatusCode: 500, url: 'https://', exception: {} });
    return await tagSearchSystem.search(searchText, maxHits);
}

export async function externalLookupTag(tagNo: string): Promise<SearchResult<TagSummaryDb>> {
    const tag = await tagsRepository().get(tagNo);
    return searchResult.successOrNotFound(tag);
}

export async function externalLookupTags(tagNos: string[]): Promise<SearchResults<TagSummaryDb>> {
    const tagSummaries = await tagsRepository().bulkGet(tagNos);
    return searchResults.successOrEmpty(tagSummaries);
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
    return searchResult.successOrNotFound(result);
}

export async function externalLookupMcPacks(ids: string[]): Promise<SearchResults<McPackDb>> {
    const result = await mcPacksRepository().bulkGet(ids);
    return searchResults.successOrEmpty(result);
}

export async function externalPunchesSearch(searchText: string, maxHits: number): Promise<SearchResults<PunchDb>> {
    const results = await punchSearchSystem.search(searchText, maxHits);
    return results;
}

export async function externalLookupPunch(id: string): Promise<SearchResult<PunchDb>> {
    const result = await punchesRepository().get(id);
    return searchResult.successOrNotFound(result);
}

export async function externalLookupPunches(ids: string[]): Promise<SearchResults<PunchDb>> {
    const result = await punchesRepository().bulkGet(ids);
    return searchResults.successOrEmpty(result);
}

async function searchMcPacksOnline(searchText: string, maxHits: number): Promise<McPackDb[]> {
    //TODO
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

export async function externalSearchForClosestTagNo(tagNo: string): Promise<SearchResult<string>> {
    const possibleTag = searchForClosestTagNo(tagNo);
    return searchResult.successOrNotFound(possibleTag?.word ?? undefined);
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

        return result.notImplementedError('sync has not been implemented for ' + offlineSystemKey);
    } catch (e) {
        return result.errorFromException(e);
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
    if (offlineSystemKey === OfflineSystem.McPack) mcPacksSystem.cancelSync();
    else if (offlineSystemKey === OfflineSystem.Tags) tagSearchSystem.cancelSync();
    else if (offlineSystemKey === OfflineSystem.Punches) punchSearchSystem.cancelSync();
    else throw new NotImplementedError('cancel not implemented for ' + offlineSystemKey);
}

async function externalDeleteAllData(): Promise<void> {
    const performanceLogger = logger.performance('..Delete All Data');
    performanceLogger.forceLog(' - Started');
    externalCancelSync(OfflineSystem.McPack);
    ClearSettings(OfflineSystem.Tags);
    await tagsAdministrator().deleteAndRecreate();
    clearInMemoryTags();
    clearLevTrie();

    externalCancelSync(OfflineSystem.McPack);
    ClearSettings(OfflineSystem.McPack);
    await mcPacksAdministrator().deleteAndRecreate();
    inMemoryMcPacksInstance().clearData();

    ClearSettings(OfflineSystem.Punches);
    await punchesAdministrator().deleteAndRecreate();
    inMemoryPunchesInstance().clearData();
    performanceLogger.forceLog(' - Done');
}

function ClearSettings(offlineSystemKey: OfflineSystem): void {
    const settings = CreateDefaultSettings(offlineSystemKey);
    SaveSettings(settings);
}

function externalToggleMockData(): void {
    mcPacksMock.toggle();
    punchesMock.toggle();
    tagsMock.toggle();
    logger.log(
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

export function externalTestCommReturnTypes(): ErrorForTesting {
    const err = new NotFoundError({
        message: 'a message',
        httpStatusCode: 404,
        url: 'https://',
        exception: { aTestProp: 'value 1' }
    });

    console.log("error'en", { ...err });

    const moreProps = Object.entries(err).filter((item) => typeof item[1] !== 'function');
    const recordsProp: Record<string, unknown> = {};
    for (const prop of moreProps) {
        recordsProp[prop[0]] = prop[1];
    }
    console.log(recordsProp);

    for (const prop of moreProps) {
        console.log(prop, typeof prop[1]);
    }

    const temp: ErrorForTesting = { type: ErrorType.ApiNotFound, ...recordsProp };
    console.log('tempppppp', temp);

    return {
        message: err.message,
        name: err.name,
        httpStatusCode: 404,
        url: err.getUrl(),
        properties: { ...moreProps },
        type: ErrorType.ApiNotFound,
        stack: err.stack
    };
}

export enum ErrorType {
    ApiNotFound = 'ApiNotFound'
}

export interface ErrorForTesting {
    type: ErrorType;
    name?: string;
    message?: string;
    stack?: string;
    httpStatusCode?: number;
    url?: string;
    properties?: Record<string, unknown>;
}
