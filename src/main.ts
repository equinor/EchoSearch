import {
    cancelAsync,
    changePlantAsync,
    closestTagSearchAsync,
    doStuffBtn2Async,
    runExpensiveAsync,
    runSyncAsync,
    searchAsync,
    setEnabledAsync
} from '.';
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

async function handleClick() {
    const result = await runExpensiveAsync().catch((e) => console.log(e));
    console.log(result);

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

let count = 0;
async function runSyncClicked() {
    await runSyncAsync(OfflineSystem.Tags);
}

async function runSyncMcPacksClicked() {
    await runSyncAsync(OfflineSystem.McPk);
}

async function setMcPackEnabled(isEnabled: boolean): Promise<void> {
    await setEnabledAsync(OfflineSystem.McPk, isEnabled);
}

async function changePlantBtnClicked() {
    await changePlantAsync();
}

async function cancelBtnClicked() {
    console.log('CancelBtnClicked', count++);
    await cancelAsync();
}

async function cameraSearchClicked() {
    const similarTag = 'A73MAO0l';
    var tag = await closestTagSearchAsync(similarTag);
    console.log(similarTag, 'camera search: found tag', tag);
}

async function searchBtnClicked() {
    var tags = await searchAsync(OfflineSystem.Tags, 'a73 pedes cran', 5);
    console.log(
        'found tags:',
        tags.map((i) => i.tagNo)
    );
}

async function expensiveBtnClicked() {
    console.log('ExpensiveBtnClicked', count++);
}

async function doStuffBtn2Clicked() {
    console.log('doStuffBtn2Clicked', count++);
    await doStuffBtn2Async();
}
