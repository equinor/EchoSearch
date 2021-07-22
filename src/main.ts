import EchoCore from '@equinor/echo-core';
import { Search, SearchResults, Syncer } from '.';
import { echoSearchWorker } from './echoWorkerInstance';
import { logger } from './logger';
import { logging, LogType } from './loggerOptions';
import { OfflineSystem } from './offlineSync/syncSettings';
import { ErrorForTesting } from './workers/externalCalls';

document.getElementById('ChangePlantBtn')?.addEventListener('click', changePlantBtnClicked);
document.getElementById('SearchBtn')?.addEventListener('click', searchBtnClicked);
document.getElementById('runSyncBtn')?.addEventListener('click', runSyncTagsClicked);
document.getElementById('cameraSearchBtn')?.addEventListener('click', cameraSearchClicked);

document.getElementById('runSyncMcPacksBtn')?.addEventListener('click', runSyncAllClicked);

document.getElementById('mcPackEnableBtn')?.addEventListener('click', () => setAllEnabled(true));
document.getElementById('mcPackDisableBtn')?.addEventListener('click', () => setAllEnabled(false));
document.getElementById('CancelBtn')?.addEventListener('click', cancelAllClicked);

document.getElementById('startBtn')?.addEventListener('click', handleClick);
document.getElementById('ExpensiveBtn')?.addEventListener('click', expensiveBtnClicked);
document.getElementById('doStuffBtn2')?.addEventListener('click', doStuffBtn2Clicked);

document.getElementById('toggleUseMockDataBtn')?.addEventListener('click', toggleMockDataClicked);

document.getElementById('testCommReturnTypes')?.addEventListener('click', testCommReturnTypesClicked);

let count = 0;

const logOptions = {
    '': LogType.Trace
};
Syncer.logConfiguration.setLevels(logOptions);
logging.setLogLevels(logOptions);
const log = logger('Main');

async function runSyncTagsClicked() {
    const result = await Syncer.runSyncAsync(OfflineSystem.Tags);
    log.info(result);
    log.info('with pretext', result);
}

async function runSyncAllClicked() {
    const keys = Object.values(OfflineSystem).filter((key) => key !== OfflineSystem.Tags);
    const syncTasks = keys.map((key) => Syncer.runSyncAsync(key));

    const results = await Promise.all(syncTasks);
    for (const result of results) {
        log.info('Sync result main:', result);
        if (!result.isSuccess) log.warn({ ...result.error });
    }
}

async function setAllEnabled(isEnabled: boolean): Promise<void> {
    //(await echoSearchWorker.anotherHelloNotWorking).hello('test');
    //await Syncer.DebugOptions.setFailureRate(OfflineSystem.Notifications, 33);

    for (const key in OfflineSystem) {
        const offlineSystemKey = key as OfflineSystem;
        if (offlineSystemKey !== OfflineSystem.Tags) {
            await Syncer.setEnabledAsync(offlineSystemKey, isEnabled);
        }
    }
}

async function cancelAllClicked() {
    log.info('CancelBtnClicked', count++);
    for (const key in OfflineSystem) {
        echoSearchWorker.cancelSync(key as OfflineSystem);
    }
}

async function changePlantBtnClicked() {
    await Syncer.changePlantAsync('JSV', true);
}

async function cameraSearchClicked() {
    const similarTag = 'A73MAO0l';
    const tag = await Search.Tags.closestTagAsync(similarTag);
    console.log(similarTag, 'camera search: found tag', tag);
}

function print<T>(
    name: string,
    mcPacks: SearchResults<T>,
    valuesToPrint: (item: T) => (string | number | Date | undefined)[]
): void {
    if (mcPacks.isSuccess) {
        console.log(
            name,
            'search',
            mcPacks.values.map((item) => valuesToPrint(item).join(' '))
        );
    } else {
        console.log(name, 'search error ', mcPacks.error?.message?.toString());
    }
}

async function searchBtnClicked() {
    try {
        const tags = await Search.Tags.searchAsync('a73 pedes cran', 5);
        print('tags', tags, (item) => [item.tagNo, item.description]);
    } catch (e) {
        console.log('caught in main', JSON.parse(JSON.stringify(e)));
    }

    const filter = { projectName: 'L.O265C.001' };
    const mcPacks = await Search.McPacks.searchAsync('0001-A01', 2, filter);
    print('mcPacks', mcPacks, (item) => [
        item.description,
        item.commPkgNo,
        item.mcPkgNo,
        item.projectName,
        item.updatedAt
    ]);

    const commPacks = await Search.CommPacks.searchAsync('A-73MA001', 2);
    print('commPacks', commPacks, (item) => [item.commPkgNo, item.description]);

    const punches = await Search.Punch.searchAsync('A-73MA001', 2);
    print('punches', punches, (item) => [
        item.id,
        item.description,
        item.tagNo,
        item.commPkgNo,
        item.mcPkgNo,
        item.updatedAt
    ]);

    const notifications = await Search.Notifications.searchAsync('A-73MA001', 2);
    print('notifications', notifications, (item) => [
        item.maintenanceRecordId,
        item.title,
        item.tagId,
        item.wbsId,
        item.wbs,
        item.changedDateTime
    ]);

    const recordLookup = await Search.Notifications.getAsync(notifications.values[0]?.maintenanceRecordId ?? '123');
    console.log('Record lookup', recordLookup);
}

async function expensiveBtnClicked() {
    log.info('ExpensiveBtnClicked', count++);
    const result = await echoSearchWorker.runExpensive();
    log.info(result);
}

async function doStuffBtn2Clicked() {
    log.info('-- this is from the new logger, doStuffBtn2Clicked');
    await echoSearchWorker.doStuff2();
}

async function toggleMockDataClicked() {
    await echoSearchWorker.toggleMockDataClicked();
}

async function testCommReturnTypesClicked(): Promise<void> {
    const result = (await echoSearchWorker.testCommReturnTypes()) as ErrorForTesting;
    log.info('in main', result);
    console.log({ ...result });
}

function authenticate(): void {
    EchoCore.EchoAuthProvider.handleLogin();
}

authenticate();

async function handleClick(): Promise<void> {
    const token = await EchoCore.EchoClient.getAccessToken();
    //const token = EchoCore.EchoClient.getAccessToken();
    //const result = authenticatorHelper.getToken();
    //console.log('echoClientId', echoClientId);
    //const token = '';
    log.info('clicked - do nothing ' + token);
    // try {
    //     const result2 = await worker.sayHi('double'); //.catch((e) => console.log('hi error:', e));
    //     console.log(result2);
    // } catch (ex) {
    //     console.log('yes, we caught error from worker in main thread :D');
    //     console.log('the error is:', ex);
    // }
    // console.log(
    //     await worker2.howOld({
    //         name: 'lots of work',
    //         num: 10000000
    //     })
    // );
}
