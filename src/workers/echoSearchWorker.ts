import * as Comlink from 'comlink';
import { SearchResult } from '../inMemory/searchResult';
import { McPackDb } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { PunchDb } from '../offlineSync/punchSyncer/punchApi';
import { SyncResult } from '../offlineSync/syncResult';
import { baseApiUrl, OfflineSystem, saveInstCode } from '../offlineSync/syncSettings';
import { createFakeDatabases } from '../offlineSync/tagSyncer/tagRepository';
import { TagSummaryDb } from '../offlineSync/tagSyncer/tagSummaryDb';
import { workerFetch } from '../service/workerFetch';
import ctx from '../setup/setup';
import { getToken } from '../tokenHelper';
import {
    externalInitialize,
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

async function callApis(): Promise<string> {
    const placeHolderApiResult = await placeholderApi();
    await ourApi();
    return placeHolderApiResult;
}

async function placeholderApi(): Promise<string> {
    console.log('dostuff');

    const response = await workerFetch('https://jsonplaceholder.typicode.com/todos/1', '');
    const data = await JSON.parse(await response.text());
    console.log('Got:', data);
    return data;
}

export const sleep = (ms: number): Promise<unknown> => new Promise((res) => setTimeout(res, ms));

async function ourApi(): Promise<void> {
    console.log('dostuff');

    const date = '2021-02-07T06:52:57.199Z'; //for testing
    const url = `${baseApiUrl}/JSV/tags?updatedSince=${date}&take=1`;
    const response = await workerFetch(url, getToken());
    const result = await JSON.parse(await response.text());
    console.log('result', result);
}

export interface EchoWorker {
    initialize(): Promise<void>;
    changePlantAsync(instCode: string): Promise<void>;
    searchTags(searchText: string, maxHits: number): Promise<SearchResult<TagSummaryDb>>;
    searchMcPacks(searchText: string, maxHits: number): Promise<SearchResult<McPackDb>>;
    searchPunches(searchText: string, maxHits: number): Promise<SearchResult<PunchDb>>;

    searchForClosestTagNo(searchText: string): Promise<string | undefined>;
    runSyncWorkerAsync(offlineSystemKey: OfflineSystem, apiAccessToken: string): Promise<SyncResult>;

    setEnabled(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<void>;

    cancelSync(): void;
    runExpensive: () => string;

    doStuff2(): Promise<void>;
}

const echoWorker: EchoWorker = {
    initialize: externalInitialize,

    async searchTags(searchText: string, maxHits = 100): Promise<SearchResult<TagSummaryDb>> {
        await testSearchMcPacks();
        await testSearchPunches();

        const tags = await externalTagSearch(searchText, maxHits);

        return tags;
    },

    searchMcPacks: externalMcPackSearch,
    searchPunches: externalPunchesSearch,

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
    }
};

//used for debugging in vsCode locally
export const echoWorkerDebugDontUseThis = echoWorker;

Comlink.expose(echoWorker, ctx);

async function testSearchMcPacks() {
    const mcPacks = await externalMcPackSearch('0001-A01', 2);
    if (mcPacks.isSuccess) {
        console.log(
            'mc packs search',
            mcPacks.data.map((item) =>
                [item.description, item.commPkgNo, item.mcPkgNo, item.projectName, item.updatedAt].join(' ')
            )
        );
    } else {
        console.log('mc packs search ', mcPacks.errorType.toString());
    }
}

async function testSearchPunches() {
    const punches = await externalPunchesSearch('A-73MA001', 2);
    if (punches.isSuccess) {
        console.log(
            'punches search',
            punches.data.map((item) =>
                [item.id, item.description, item.tagNo, item.commPkgNo, item.mcPkgNo, item.updatedAt].join(' ')
            )
        );
    } else {
        console.log('punches search ', punches.errorType.toString());
    }
}
