import * as Comlink from 'comlink';
import DummyWorker from 'web-worker:./workers/dummyWorker.ts';
import EchoSearchWorker from 'web-worker:./workers/echoSearchWorker.ts';
import { OfflineSystem } from './offlineSync/syncSettings';
import { TagSummaryDb } from './offlineSync/tagSyncer/tagSummaryDb';
import { Work } from './workers/dummyWorker';
import { EchoWorker } from './workers/echoSearchWorker';

const worker2 = Comlink.wrap<Work>(new DummyWorker());
const echoSearchWorker = Comlink.wrap<EchoWorker>(new EchoSearchWorker());
echoSearchWorker.initialize();

export async function runExpensiveAsync(): Promise<string> {
    return await echoSearchWorker.runExpensive();
}

export async function runSyncAsync(offlineSystemKey: OfflineSystem): Promise<void> {
    await echoSearchWorker.runSyncWorkerAsync(offlineSystemKey);
}
export async function setEnabledAsync(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<void> {
    await echoSearchWorker.setEnabled(offlineSystemKey, isEnabled);
}

export async function changePlantAsync(): Promise<void> {
    await echoSearchWorker.changePlantAsync();
}

export async function cancelAsync(): Promise<void> {
    await echoSearchWorker.cancelSync();
}

export async function closestTagSearchAsync(tagNoSearch: string): Promise<string | undefined> {
    return await echoSearchWorker.searchForClosestTagNo(tagNoSearch);
}

export async function searchAsync(
    offlineSystemKey: OfflineSystem,
    searchText: string,
    maxHits: number
): Promise<TagSummaryDb[]> {
    return await echoSearchWorker.searchTags(searchText, maxHits);
}

export async function doStuffBtn2Async() {
    await echoSearchWorker.doStuff2();
}
