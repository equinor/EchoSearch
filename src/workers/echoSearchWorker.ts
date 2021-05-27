import * as Comlink from 'comlink';
import { SearchResult, SearchResults } from '../inMemory/searchResult';
import { McPackDb } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { PunchDb } from '../offlineSync/punchSyncer/punchApi';
import { SyncResult } from '../offlineSync/syncResult';
import { OfflineSystem, saveInstCode } from '../offlineSync/syncSettings';
import { createFakeDatabases } from '../offlineSync/tagSyncer/tagRepository';
import { TagSummaryDb } from '../offlineSync/tagSyncer/tagSummaryDb';
import ctx from '../setup/setup';
import {
    externalInitialize,
    externalLookupMcPack,
    externalLookupMcPacks,
    externalLookupPunch,
    externalLookupPunches,
    externalLookupTag,
    externalLookupTags,
    externalMcPackSearch,
    externalPunchesSearch,
    externalSearchForClosestTagNo,
    externalTagSearch,
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

export const sleep = (ms: number): Promise<unknown> => new Promise((res) => setTimeout(res, ms));

export interface EchoWorker {
    initialize(): Promise<void>;
    changePlantAsync(instCode: string): Promise<void>;

    searchTags(searchText: string, maxHits: number): Promise<SearchResults<TagSummaryDb>>;
    lookupTagAsync(tagNo: string): Promise<SearchResult<TagSummaryDb>>;
    lookupTagsAsync(tagNos: string[]): Promise<SearchResults<TagSummaryDb>>;

    searchMcPacks(searchText: string, maxHits: number): Promise<SearchResults<McPackDb>>;
    lookupMcPackAsync(tagNo: string): Promise<SearchResult<McPackDb>>;
    lookupMcPacksAsync(tagNos: string[]): Promise<SearchResults<McPackDb>>;

    searchPunches(searchText: string, maxHits: number): Promise<SearchResults<PunchDb>>;
    lookupPunchAsync(tagNo: string): Promise<SearchResult<PunchDb>>;
    lookupPunchesAsync(tagNos: string[]): Promise<SearchResults<PunchDb>>;

    searchForClosestTagNo(tagNo: string): Promise<string | undefined>;
    runSyncWorkerAsync(offlineSystemKey: OfflineSystem, apiAccessToken: string): Promise<SyncResult>;

    setEnabled(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<void>;

    cancelSync(): void;
    runExpensive: () => string;

    doStuff2(): Promise<void>;
    toggleMockDataClicked(): void;
}

const echoWorker: EchoWorker = {
    initialize: externalInitialize,

    searchTags: externalTagSearch,
    lookupTagAsync: externalLookupTag,
    lookupTagsAsync: externalLookupTags,

    searchMcPacks: externalMcPackSearch,
    lookupMcPackAsync: externalLookupMcPack,
    lookupMcPacksAsync: externalLookupMcPacks,

    searchPunches: externalPunchesSearch,
    lookupPunchAsync: externalLookupPunch,
    lookupPunchesAsync: externalLookupPunches,

    searchForClosestTagNo: externalSearchForClosestTagNo,

    async changePlantAsync(instCode: string): Promise<void> {
        await saveInstCode(instCode);
        await syncContract.externalDeleteAllData();
    },

    runSyncWorkerAsync: syncContract.externalRunSync,

    cancelSync(): void {
        syncContract.externalCancelSync(OfflineSystem.McPack);
    },

    setEnabled: syncContract.externalSetEnabled,

    runExpensive(): string {
        expensive(2000);
        return 'done';
    },

    async doStuff2(): Promise<void> {
        createFakeDatabases();
    },

    toggleMockDataClicked(): void {
        syncContract.externalToggleMockData();
    }
};

//used for debugging in vsCode locally
export const echoWorkerDebugDontUseThis = echoWorker;

Comlink.expose(echoWorker, ctx);
