import {
    inMemoryMcPacksInit,
    inMemoryMcPacksInstance,
    searchInMemoryMcPacksWithText
} from '../inMemory/inMemoryMcPacks';
import { clearInMemoryTags, isInMemoryTagsReady } from '../inMemory/inMemoryTags';
import { clearLevTrie, searchForClosestTagNo, searchTags } from '../inMemory/inMemoryTagSearch';
import { initInMemoryTagsFromIndexDb } from '../inMemory/inMemoryTagsInitializer';
import { logPerformance } from '../logger';
import { McPackDb } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { mcPacksAdministrator, mcPacksRepository } from '../offlineSync/mcPacksSyncer/mcPacksRepository';
import { setMcPacksIsEnabled, syncFullMcPacks, syncUpdateMcPacks } from '../offlineSync/mcPacksSyncer/mcPacksSyncer';
import { SyncResult } from '../offlineSync/syncResult';
import { runSync } from '../offlineSync/syncRunner';
import {
    CreateDefaultSettings,
    GetSetting,
    loadOfflineSettings,
    OfflineSystem,
    SaveSettings
} from '../offlineSync/syncSettings';
import { searchTagsOnline } from '../offlineSync/tagSyncer/tagApi';
import { tagsAdministrator } from '../offlineSync/tagSyncer/tagRepository';
import { TagSummaryDb } from '../offlineSync/tagSyncer/tagSummaryDb';
import { syncFullTags, syncUpdateTags } from '../offlineSync/tagSyncer/tagSyncer';
import { SearchSystem } from './searchSystem';

let _counter = 0;
function functionShouldOnlyBeCalledOnce(): void {
    console.error('--called once only?? no :( counter should increase if its same instance of file..', _counter++);
}

functionShouldOnlyBeCalledOnce();

let initDone = false;
let mcPacksSystem: SearchSystem<McPackDb>;
let tagSearchSystem: SearchSystem<TagSummaryDb>;

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

async function initTags(): Promise<void> {
    const performanceLogger = logPerformance('Init Tags');
    await tagsAdministrator().init();
    const tagCount = await initInMemoryTagsFromIndexDb();

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));
    await wait(5000);

    performanceLogger.forceLogDelta('Tags done ' + tagCount);
}

async function internalInitialize(): Promise<void> {
    if (initDone) {
        console.warn('internalInitialize already done, returning');
        return;
    }

    const performanceLogger = logPerformance('InternalInitialize ');

    await loadOfflineSettings();
    performanceLogger.forceLogDelta('Loaded Offline Settings 11');

    const initMcTask = initMcPacks();
    const initTagsTask = initTags();

    performanceLogger.forceLog('SearchSystems starting');

    mcPacksSystem = new SearchSystem<McPackDb>(
        OfflineSystem.McPk,
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

    performanceLogger.forceLog('SearchSystems instantiated');

    await initMcTask;
    await initTagsTask;
    performanceLogger.log('DONE');

    //Keep for performance testing when we have more items to sync.
    // const tagsTask = initInMemoryTagsFromIndexDb();
    // const mcPacksTask = inMemoryMcPacksInit();
    // const result = await Promise.all([tagsTask, mcPacksTask]);
    // console.log('done loading', result);

    performanceLogger.forceLog('Search module initialize done');
    initDone = true;
}

export async function externalTagSearch(searchText: string, maxHits: number): Promise<TagSummaryDb[]> {
    const results = await tagSearchSystem.search(searchText, maxHits);
    return results;
}

export async function externalMcPackSearch(searchText: string, maxHits: number): Promise<McPackDb[]> {
    // if (mcPacksSearcher === undefined) {
    //     return [];
    // }
    const results = await mcPacksSystem.search(searchText, maxHits);
    return results;
}

async function searchMcPacksOnline(searchText: string, maxHits: number): Promise<McPackDb[]> {
    return [
        {
            commPkgNo: '1',
            description: 'McPacks online Search',
            mcPkgNo: searchText,
            projectName: '2',
            id: 5,
            updatedAt: new Date()
        } as McPackDb
    ];
}

export async function externalSearchForClosestTagNo(searchText: string): Promise<string | undefined> {
    const possibleTag = searchForClosestTagNo(searchText);
    return possibleTag ? possibleTag.word : undefined;
}

export async function externalRunSync(offlineSystemKey: OfflineSystem): Promise<SyncResult> {
    if (offlineSystemKey === OfflineSystem.McPk) {
        return await runSync(mcPacksSystem);
    } else if (offlineSystemKey === OfflineSystem.Tags) {
        console.log('run sync tags');
        return await runSync(tagSearchSystem);
    }
    return { isSuccess: false, error: 'sync has not been implemented for ' + offlineSystemKey } as SyncResult;
}

export async function externalSetEnabled(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<void> {
    setMcPacksIsEnabled(isEnabled);

    const setting = GetSetting(offlineSystemKey);
    console.log(
        'Setting: ',
        [setting.offlineSystemKey, setting.isEnable, setting.lastSyncedAtDate, setting.syncDataDate].join(' ')
    );
}

export function externalCancelSync(offlineSystemKey: OfflineSystem): void {
    mcPacksRepository().cancelSync();
    //return await runSync(offlineSystemKey);
}

export async function externalClearAllTags() {
    ClearSettings(OfflineSystem.Tags);
    await tagsAdministrator().deleteAndRecreate();
    clearInMemoryTags();
    clearLevTrie();

    ClearSettings(OfflineSystem.McPk);
    await mcPacksAdministrator().deleteAndRecreate();
    inMemoryMcPacksInstance().clearData();
}

function ClearSettings(offlineSystemKey: OfflineSystem): void {
    const settings = CreateDefaultSettings(offlineSystemKey);
    SaveSettings(settings);
}
