import EchoCore from '@equinor/echo-core';
import { Search, Syncer } from '.';
import { echoSearchWorker } from './echoWorkerInstance';
import { OfflineSystem } from './offlineSync/syncSettings';
import { ErrorForTesting } from './workers/externalCalls';

document.getElementById('ChangePlantBtn')?.addEventListener('click', changePlantBtnClicked);
document.getElementById('SearchBtn')?.addEventListener('click', searchBtnClicked);
document.getElementById('runSyncBtn')?.addEventListener('click', runSyncClicked);
document.getElementById('cameraSearchBtn')?.addEventListener('click', cameraSearchClicked);

document.getElementById('runSyncMcPacksBtn')?.addEventListener('click', runSyncMcPacksClicked);

document.getElementById('mcPackEnableBtn')?.addEventListener('click', () => setMcPackEnabled(true));
document.getElementById('mcPackDisableBtn')?.addEventListener('click', () => setMcPackEnabled(false));

document.getElementById('startBtn')?.addEventListener('click', handleClick);
document.getElementById('CancelBtn')?.addEventListener('click', cancelBtnClicked);
document.getElementById('ExpensiveBtn')?.addEventListener('click', expensiveBtnClicked);
document.getElementById('doStuffBtn2')?.addEventListener('click', doStuffBtn2Clicked);

document.getElementById('toggleUseMockDataBtn')?.addEventListener('click', toggleMockDataClicked);

document.getElementById('testCommReturnTypes')?.addEventListener('click', testCommReturnTypesClicked);

let count = 0;
async function runSyncClicked() {
    await Syncer.runSyncAsync(OfflineSystem.Tags);
}

async function runSyncMcPacksClicked() {
    const mcPackSync = Syncer.runSyncAsync(OfflineSystem.McPack);
    const punchesSync = Syncer.runSyncAsync(OfflineSystem.Punches);
    const results = await Promise.all([mcPackSync, punchesSync]);
    for (const result of results) {
        console.log('Sync result:', result);
        if (!result.isSuccess) console.log({ ...result.error });
    }
}

async function setMcPackEnabled(isEnabled: boolean): Promise<void> {
    await Syncer.setEnabledAsync(OfflineSystem.McPack, isEnabled);
    await Syncer.setEnabledAsync(OfflineSystem.Punches, isEnabled);
}

async function changePlantBtnClicked() {
    await Syncer.changePlantAsync('JSV');
}

async function cameraSearchClicked() {
    const similarTag = 'A73MAO0l';
    const tag = await Search.closestTagSearchAsync(similarTag);
    console.log(similarTag, 'camera search: found tag', tag);
}

async function searchBtnClicked() {
    try {
        const tags = await Search.searchTagsAsync('a73 pedes cran', 5);
        if (tags.isSuccess) {
            console.log(
                'found tags:',
                tags.data.map((i) => i.tagNo)
            );
        } else {
            console.log('tags search error', tags.error);
        }
    } catch (e) {
        console.log('caught in main', JSON.parse(JSON.stringify(e)));
    }

    const mcPacks = await Search.searchMcPacksAsync('0001-A01', 2);
    if (mcPacks.isSuccess) {
        console.log(
            'mc packs search',
            mcPacks.data.map((item) =>
                [item.description, item.commPkgNo, item.mcPkgNo, item.projectName, item.updatedAt].join(' ')
            )
        );
    } else {
        console.log('mc packs search ', mcPacks.error?.message?.toString());
    }

    const punches = await Search.searchPunchesAsync('A-73MA001', 2);
    if (punches.isSuccess) {
        console.log(
            'punches search',
            punches.data.map((item) =>
                [item.id, item.description, item.tagNo, item.commPkgNo, item.mcPkgNo, item.updatedAt].join(' ')
            )
        );
    } else {
        console.log('punches search ', punches.error?.message?.toString());
    }
}

async function expensiveBtnClicked() {
    console.log('ExpensiveBtnClicked', count++);
    const result = echoSearchWorker.runExpensive();
    console.log(result);
}

async function doStuffBtn2Clicked() {
    console.log('doStuffBtn2Clicked', count++);
    await echoSearchWorker.doStuff2();
}

async function toggleMockDataClicked() {
    await echoSearchWorker.toggleMockDataClicked();
}

async function testCommReturnTypesClicked(): Promise<void> {
    const result = (await echoSearchWorker.testCommReturnTypes()) as ErrorForTesting;
    console.log('in main', result);
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
    console.log('clicked - do nothing ' + token);
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

async function cancelBtnClicked() {
    console.log('CancelBtnClicked', count++);
    echoSearchWorker.cancelSync();
}
