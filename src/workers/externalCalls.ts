import { NotFoundError } from '@equinor/echo-base';
import { NotImplementedError, result, Result } from '../baseResult';
import { inMemory } from '../inMemory/inMemoryExports';
import { searchForClosestTagNo } from '../inMemory/inMemoryTagSearch';
import { initLevTrieFromInMemoryTags } from '../inMemory/inMemoryTagsInitializer';
import { searchResult, SearchResult, SearchResults } from '../inMemory/searchResult';
import { logger } from '../logger';
import { logging, LogType } from '../loggerOptions';
import { McPackDb, mcPacksMock } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { mcPacksRepository } from '../offlineSync/mcPacksSyncer/mcPacksRepository';
import { mcPacksSyncSystem } from '../offlineSync/mcPacksSyncer/mcPacksSyncer';
import { NotificationDb } from '../offlineSync/notificationSyncer/notificationApi';
import { notificationsRepository } from '../offlineSync/notificationSyncer/notificationRepository';
import { notificationsSyncSystem } from '../offlineSync/notificationSyncer/notificationSyncer';
import { PunchDb, punchesMock } from '../offlineSync/punchSyncer/punchApi';
import { punchesRepository } from '../offlineSync/punchSyncer/punchRepository';
import { punchesSyncSystem } from '../offlineSync/punchSyncer/punchSyncer';
import { runSync } from '../offlineSync/syncRunner';
import { OfflineSystem, Settings } from '../offlineSync/syncSettings';
import { tagsMock } from '../offlineSync/tagSyncer/tagApi';
import { tagsRepository } from '../offlineSync/tagSyncer/tagRepository';
import { TagSummaryDb } from '../offlineSync/tagSyncer/tagSummaryDb';
import { tagsSyncSystem } from '../offlineSync/tagSyncer/tagSyncer';
import { setToken } from '../tokenHelper';
import { SearchSystem } from './searchSystem';

const log = logger('externalCalls');

let _counter = 0;
function functionShouldOnlyBeCalledOnce(): void {
    log.error('--called once only?? no :( counter should increase if its same instance of file..', _counter++);
}

functionShouldOnlyBeCalledOnce();

let _initDone = false;
let _mcPacksSearchSystem: SearchSystem<McPackDb>;
let _tagSearchSystem: SearchSystem<TagSummaryDb>;
let _punchSearchSystem: SearchSystem<PunchDb>;
let _notificationsSearchSystem: SearchSystem<NotificationDb>;

let _initTaskInstance: Promise<Result> | undefined = undefined;

export async function externalInitializeTask(): Promise<Result> {
    // const wait = (ms) => new Promise((res) => setTimeout(res, ms));
    // const p1 = new Promise((res) => setTimeout(() => res('p1'), 1000));
    // const p2 = new Promise((res) => setTimeout(() => res('p2'), 500));
    // const result = await Promise.race([p1, p2]);

    if (!_initTaskInstance) _initTaskInstance = internalInitialize();
    return _initTaskInstance;
}

async function initTags(): Promise<void> {
    const performanceLogger = log.performance('Init Tags');
    await tagsSyncSystem.initTask();
    await initLevTrieFromInMemoryTags();

    const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
    await wait(5000);

    performanceLogger.forceLogDelta('done');
}

async function internalInitialize(): Promise<Result> {
    const logOptions = {
        '': LogType.Trace
    };

    logging.setLogLevels(logOptions);
    log.info('-------------- externalInitialize ------------ ');
    log.trace('trace');
    log.debug('debug');
    log.info('info');
    log.warn('warn');
    log.error('error');
    log.create('child').info('-- this is from the new logger 222');

    if (_initDone) {
        log.warn('internalInitialize already done, returning');
        return result.success();
    }

    const performanceLogger = log.performance();
    await Settings.loadOfflineSettings();
    performanceLogger.forceLogDelta('Loaded Offline Settings 11');

    externalToggleMockData();

    const initMcTask = mcPacksSyncSystem.initTask();
    const initTagsTask = initTags();
    const initPunchesTask = punchesSyncSystem.initTask();
    const initNotificationTask = notificationsSyncSystem.initTask();

    performanceLogger.forceLog('SearchSystems starting');

    _mcPacksSearchSystem = new SearchSystem<McPackDb>(
        OfflineSystem.McPack,
        initMcTask,
        () => inMemory.McPacks.isReady(),
        async (searchText, maxHits) => inMemory.McPacks.search(searchText, maxHits),
        async (searchText, maxHits) => inMemory.McPacks.searchOnline(searchText, maxHits)
    );

    _tagSearchSystem = new SearchSystem<TagSummaryDb>(
        OfflineSystem.Tags,
        initTagsTask,
        () => inMemory.Tags.isReady(),
        async (searchText, maxHits) => inMemory.Tags.search(searchText, maxHits),
        async (searchText, maxHits) => inMemory.Tags.searchOnline(searchText, maxHits)
    );

    _punchSearchSystem = new SearchSystem<PunchDb>(
        OfflineSystem.Punches,
        initPunchesTask,
        () => inMemory.Punches.isReady(),
        async (searchText, maxHits) => inMemory.Punches.search(searchText, maxHits),
        async () => []
        //async (searchText, maxHits) => [], //searchTagsOnline(searchText, maxHits),
    );

    _notificationsSearchSystem = new SearchSystem<NotificationDb>(
        OfflineSystem.Notifications,
        initNotificationTask,
        () => inMemory.Notifications.isReady(),
        async (searchText, maxHits) => inMemory.Notifications.search(searchText, maxHits),
        async () => []
    );

    performanceLogger.forceLog('SearchSystems instantiated');

    await Promise.all([initMcTask, initPunchesTask, initTagsTask, initNotificationTask]);
    performanceLogger.forceLog('----------- Search module initialize done -----------');
    _initDone = true;
    return result.success();
}

export function externalNotifications() {
    return {
        search: (searchText: string, maxHits: number) => _notificationsSearchSystem.search(searchText, maxHits),
        lookup: notificationsRepository().get,
        lookups: notificationsRepository().bulkGet
    };
}

export async function externalTagSearch(searchText: string, maxHits: number): Promise<SearchResults<TagSummaryDb>> {
    //test error throw new NetworkError({ message: 'test message', httpStatusCode: 500, url: 'https://', exception: {} });
    return await _tagSearchSystem.search(searchText, maxHits);
}
export async function externalSearchForClosestTagNo(tagNo: string): Promise<SearchResult<string>> {
    const possibleTag = searchForClosestTagNo(tagNo);
    return searchResult.successOrNotFound(possibleTag?.word ?? undefined);
}

export async function externalLookupTag(tagNo: string): Promise<SearchResult<TagSummaryDb>> {
    return await tagsRepository().get(tagNo);
}

export async function externalLookupTags(tagNos: string[]): Promise<SearchResults<TagSummaryDb>> {
    return await tagsRepository().bulkGet(tagNos);
}

export async function externalMcPackSearch(searchText: string, maxHits: number): Promise<SearchResults<McPackDb>> {
    // if (mcPacksSearcher === undefined) {
    //     return [];
    // }
    return await _mcPacksSearchSystem.search(searchText, maxHits);
}
export async function externalLookupMcPack(id: string): Promise<SearchResult<McPackDb>> {
    return await mcPacksRepository().get(id);
}

export async function externalLookupMcPacks(ids: string[]): Promise<SearchResults<McPackDb>> {
    return await mcPacksRepository().bulkGet(ids);
}

export async function externalPunchesSearch(searchText: string, maxHits: number): Promise<SearchResults<PunchDb>> {
    return await _punchSearchSystem.search(searchText, maxHits);
}

export async function externalLookupPunch(id: string): Promise<SearchResult<PunchDb>> {
    return await punchesRepository().get(id);
}

export async function externalLookupPunches(ids: string[]): Promise<SearchResults<PunchDb>> {
    return await punchesRepository().bulkGet(ids);
}

async function externalRunSync(offlineSystemKey: OfflineSystem, apiAccessToken: string): Promise<Result> {
    setToken(apiAccessToken);

    if (offlineSystemKey === OfflineSystem.McPack) {
        return await runSync(mcPacksSyncSystem);
    } else if (offlineSystemKey === OfflineSystem.Tags) {
        return await runSync(tagsSyncSystem);
    } else if (offlineSystemKey === OfflineSystem.Punches) {
        return await runSync(punchesSyncSystem);
    } else if (offlineSystemKey === OfflineSystem.Notifications) {
        return await runSync(notificationsSyncSystem);
    }
    return result.notImplementedError('externalRunSync not implemented for ' + offlineSystemKey);
}

async function externalSetEnabled(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<Result> {
    const syncSystem = getSyncSystem(offlineSystemKey);
    if (!syncSystem) return result.notImplementedError('SetEnabled not implemented for ' + offlineSystemKey);

    syncSystem.setIsEnabled(isEnabled);
    return result.success();
}

async function externalCancelSync(offlineSystemKey: OfflineSystem): Promise<Result> {
    const syncSystem = getSyncSystem(offlineSystemKey);
    if (!syncSystem) throw new NotImplementedError('cancel not implemented for ' + offlineSystemKey);

    syncSystem.cancelSync();
    log.create(offlineSystemKey).trace('Sync canceled done');
    return result.success();
}

const cancelSyncAll = () => allSyncSystems().forEach((item) => item.cancelSync());

function getSyncSystem(offlineSystemKey: OfflineSystem) {
    switch (offlineSystemKey) {
        case OfflineSystem.Tags:
            return tagsSyncSystem;
        case OfflineSystem.Punches:
            return punchesSyncSystem;
        case OfflineSystem.McPack:
            return mcPacksSyncSystem;
        case OfflineSystem.Notifications:
            return notificationsSyncSystem;
    }
    return undefined;
}

function allSyncSystems() {
    return [tagsSyncSystem, notificationsSyncSystem, punchesSyncSystem, mcPacksSyncSystem];
}

async function externalDeleteAllData(): Promise<void> {
    const performanceLogger = log.performance('..Delete All Data');
    performanceLogger.forceLog(' - Started');
    externalCancelSync(OfflineSystem.McPack);

    const all = allSyncSystems();
    await Promise.all(all.map(async (item) => await item.clearAllData()));

    performanceLogger.forceLog(' - Done');
}

function externalToggleMockData(): void {
    mcPacksMock.toggle();
    punchesMock.toggle();
    tagsMock.toggle();
    log.info('use mock tags:', tagsMock.isEnabled, 'mcPacks', mcPacksMock.isEnabled, 'punches', punchesMock.isEnabled);
}

async function externalChangePlant(instCode: string, forceDeleteIfSameAlreadySelected = false): Promise<Result> {
    if (!forceDeleteIfSameAlreadySelected && (await Settings.getInstCodeOrUndefinedAsync()) === instCode)
        return result.success();

    cancelSyncAll();
    await Settings.saveInstCode(instCode);
    await syncContract.externalDeleteAllData();
    return result.success();
}

export const syncContract = {
    externalDeleteAllData,
    externalCancelSync,
    externalSetEnabled,
    externalRunSync,
    externalToggleMockData,
    externalChangePlant
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
