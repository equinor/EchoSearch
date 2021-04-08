import * as Comlink from 'comlink';
import { SyncResult } from '../offlineSync/syncResult';
import { baseApiUrl, OfflineSystem, saveInstCode } from '../offlineSync/syncSettings';
import { createFakeDatabases } from '../offlineSync/tagSyncer/tagRepository';
import { TagSummaryDb } from '../offlineSync/tagSyncer/tagSummaryDb';
import { workerFetch } from '../service/workerFetch';
import ctx from '../setup/setup';
import { getToken } from '../tokenHelper';
import {
    externalCancelSync,
    externalDeleteAllData,
    externalInitialize,
    externalMcPackSearch,
    externalRunSync,
    externalSearchForClosestTagNo,
    externalSetEnabled,
    externalTagSearch
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

async function callApis(arg: string): Promise<string> {
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

async function throwErrorForTesting(): Promise<void> {
    await sleep(100);
    throw new Error('this is a test error');
}
export const sleep = (ms: number): Promise<unknown> => new Promise((res) => setTimeout(res, ms));

async function ourApi(): Promise<void> {
    console.log('dostuff');

    const date = '2021-02-07T06:52:57.199Z'; //for testing
    const url = `${baseApiUrl}/JSV/tags?updatedSince=${date}&take=1`;
    const response = await workerFetch(url, getToken());
    var result = await JSON.parse(await response.text());
    console.log('result', result);
}

export interface EchoWorker {
    initialize(): Promise<void>;
    changePlantAsync(instCode: string): Promise<void>;
    searchTags(searchText: string, maxHits: number): Promise<TagSummaryDb[]>;
    searchForClosestTagNo(searchText: string): Promise<string | undefined>;
    runSyncWorkerAsync(offlineSystemKey: OfflineSystem): Promise<SyncResult>;

    setEnabled(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<void>;

    cancelSync(): void;
    runExpensive: () => string;

    sayHi: (name: string) => Promise<string>;

    doStuff2(): Promise<void>;
}

const echoWorker: EchoWorker = {
    async initialize(): Promise<void> {
        console.log('worker calling externalInitialize');
        await externalInitialize();
    },
    async searchTags(searchText: string, maxHits = 100): Promise<TagSummaryDb[]> {
        const mcPacks = await externalMcPackSearch('0001-A01', 2);
        console.log(
            'mc packs search',
            mcPacks.map((item) =>
                [item.description, item.commPkgNo, item.mcPkgNo, item.projectName, item.updatedAt].join(' ')
            )
        );
        const tags = await externalTagSearch(searchText, maxHits);

        return tags;
    },

    async searchForClosestTagNo(searchText: string): Promise<string | undefined> {
        return await externalSearchForClosestTagNo(searchText);
    },

    async changePlantAsync(instCode: string): Promise<void> {
        await saveInstCode(instCode);
        await externalDeleteAllData();
    },

    async runSyncWorkerAsync(offlineSystemKey: OfflineSystem): Promise<SyncResult> {
        return await externalRunSync(offlineSystemKey);
    },
    cancelSync(): void {
        externalCancelSync(OfflineSystem.McPack);
    },

    async setEnabled(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<void> {
        await externalSetEnabled(offlineSystemKey, isEnabled);
    },

    // async function sayHi:(name: string) Promise<string>
    // {
    //     return "hello 222 " + name;
    // }
    async sayHi(name: string): Promise<string> {
        try {
            await throwErrorForTesting();
        } catch (e) {
            console.error('error caught');
            console.log(e);
        }

        // try {
        return await callApis(name);
        // } catch (e) {
        //     console.error('are we able to catch api errors?');
        //     console.log(e);
        // }

        //return 'error caught and handled';
    },

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
