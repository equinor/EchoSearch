import * as Comlink from 'comlink';
import { result, Result } from '../baseResult';
import { SearchResult, SearchResults } from '../inMemory/searchResult';
import { logger } from '../logger';
import { McPackDb } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { NotificationDb } from '../offlineSync/notificationSyncer/notificationApi';
import { PunchDb } from '../offlineSync/punchSyncer/punchApi';
import { OfflineSystem } from '../offlineSync/syncSettings';
import { createFakeDatabases } from '../offlineSync/tagSyncer/tagRepository';
import { TagSummaryDb } from '../offlineSync/tagSyncer/tagSummaryDb';
import ctx from '../setup/setup';
import {
    externalInitializeTask,
    externalLookupMcPack,
    externalLookupMcPacks,
    externalLookupPunch,
    externalLookupPunches,
    externalLookupTag,
    externalLookupTags,
    externalMcPackSearch,
    externalNotifications,
    externalPunchesSearch,
    externalSearchForClosestTagNo,
    externalTagSearch,
    externalTestCommReturnTypes,
    syncContract
} from './externalCalls';

function expensive(time: number): number {
    const start = Date.now();
    let count = 0;
    while (Date.now() - start < time) {
        count++;
        if (count % 10000000 === 0) {
            console.log('tick');
        }
    }

    return count;
}

const log = logger('EchoSearchWorker');

export const sleep = (ms: number): Promise<unknown> => new Promise((res) => setTimeout(res, ms));

export interface EchoWorker {
    initialize(): Promise<Result>;
    changePlantAsync(instCode: string, forceDeleteIfSameAlreadySelected: boolean): Promise<Result>;

    searchTags(searchText: string, maxHits: number): Promise<SearchResults<TagSummaryDb>>;
    searchForClosestTagNo(tagNo: string): Promise<SearchResult<string>>;
    lookupTagAsync(tagNo: string): Promise<SearchResult<TagSummaryDb>>;
    lookupTagsAsync(tagNos: string[]): Promise<SearchResults<TagSummaryDb>>;

    searchMcPacks(searchText: string, maxHits: number): Promise<SearchResults<McPackDb>>;
    lookupMcPackAsync(tagNo: string): Promise<SearchResult<McPackDb>>;
    lookupMcPacksAsync(tagNos: string[]): Promise<SearchResults<McPackDb>>;

    searchPunches(searchText: string, maxHits: number): Promise<SearchResults<PunchDb>>;
    lookupPunchAsync(tagNo: string): Promise<SearchResult<PunchDb>>;
    lookupPunchesAsync(tagNos: string[]): Promise<SearchResults<PunchDb>>;

    searchNotifications(searchText: string, maxHits: number): Promise<SearchResults<NotificationDb>>;

    runSyncWorkerAsync(offlineSystemKey: OfflineSystem, apiAccessToken: string): Promise<Result>;

    setEnabled(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<Result>;

    cancelSync(offlineSystemKey: OfflineSystem): void;
    runExpensive: () => string;

    doStuff2(): Promise<void>;
    toggleMockDataClicked(): void;
    testCommReturnTypes(): unknown;
}

async function tryCatchToResult<T extends Result>(func: () => Promise<T>): Promise<T> {
    try {
        const funcResult = await func();
        if (!funcResult.isSuccess) log.debug('Error:', funcResult.error);
        return funcResult;
    } catch (error) {
        log.warn(error);
        return result.errorFromException(error) as T;
    }
}

const echoWorker: EchoWorker = {
    initialize: (...args) => tryCatchToResult(() => externalInitializeTask(...args)),

    searchTags: (...args) => tryCatchToResult(() => externalTagSearch(...args)),
    searchForClosestTagNo: (...args) => tryCatchToResult(() => externalSearchForClosestTagNo(...args)),
    lookupTagAsync: (...args) => tryCatchToResult(() => externalLookupTag(...args)),
    lookupTagsAsync: (...args) => tryCatchToResult(() => externalLookupTags(...args)),

    searchMcPacks: (...args) => tryCatchToResult(() => externalMcPackSearch(...args)),
    lookupMcPackAsync: (...args) => tryCatchToResult(() => externalLookupMcPack(...args)),
    lookupMcPacksAsync: (...args) => tryCatchToResult(() => externalLookupMcPacks(...args)),

    searchPunches: (...args) => tryCatchToResult(() => externalPunchesSearch(...args)),
    lookupPunchAsync: (...args) => tryCatchToResult(() => externalLookupPunch(...args)),
    lookupPunchesAsync: (...args) => tryCatchToResult(() => externalLookupPunches(...args)),

    searchNotifications: (...args) => tryCatchToResult(() => externalNotifications().search(...args)),

    changePlantAsync: (...args) => tryCatchToResult(() => syncContract.externalChangePlant(...args)),
    runSyncWorkerAsync: (...args) => tryCatchToResult(() => syncContract.externalRunSync(...args)),
    cancelSync: (...args) => tryCatchToResult(() => syncContract.externalCancelSync(...args)),
    setEnabled: (...args) => tryCatchToResult(() => syncContract.externalSetEnabled(...args)),

    runExpensive(): string {
        expensive(2000);
        return 'done';
    },

    async doStuff2(): Promise<void> {
        createFakeDatabases();
    },

    toggleMockDataClicked(): void {
        syncContract.externalToggleMockData();
    },

    testCommReturnTypes(): unknown {
        const result = externalTestCommReturnTypes();
        console.log('EchoWorker', result);
        console.log('EchoWorker props', { ...result });
        return result;
    }
};

//used for debugging in vsCode locally
export const echoWorkerDebugDontUseThis = echoWorker;

Comlink.expose(echoWorker, ctx);
