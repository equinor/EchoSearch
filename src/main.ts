import { search, syncer } from '.';
import { echoSearchWorker } from './echoWorkerInstance';
import { OfflineSystem } from './offlineSync/syncSettings';

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

let count = 0;
async function runSyncClicked() {
    await syncer.runSyncAsync(OfflineSystem.Tags);
}

async function runSyncMcPacksClicked() {
    await syncer.runSyncAsync(OfflineSystem.McPk);
}

async function setMcPackEnabled(isEnabled: boolean): Promise<void> {
    await syncer.setEnabledAsync(OfflineSystem.McPk, isEnabled);
}

async function changePlantBtnClicked() {
    await syncer.changePlantAsync('JSV');
}

async function cameraSearchClicked() {
    const similarTag = 'A73MAO0l';
    var tag = await search.closestTagSearchAsync(similarTag);
    console.log(similarTag, 'camera search: found tag', tag);
}

async function searchBtnClicked() {
    var tags = await search.searchAsync(OfflineSystem.Tags, 'a73 pedes cran', 5);
    console.log(
        'found tags:',
        tags.map((i) => i.tagNo)
    );
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

async function handleClick() {
    //const result = authenticatorHelper.getToken();
    //console.log('echoClientId', echoClientId);
    console.log('clicked - do nothing');
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
