import EchoCore from '@equinor/echo-core';
import { Search, Syncer } from '.';
import { echoSearchWorker } from './echoWorkerInstance';
import { Filter } from './inMemory/searchFilter';
import { logger } from './logger';
import { logging, LogLevel } from './loggerOptions';
import { OfflineSystem } from './offlineSync/offlineSystem';
import { ResultArray } from './results/baseResult';
import { McPackDto } from './workers/dataTypes';
import { ErrorForTesting } from './workers/externalCalls';

document.getElementById('SelectedButton')?.addEventListener('click', selectNextOfflineSystem);
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

function getSearchInput(): string | undefined {
    const text = (document.getElementById('SearchInput') as HTMLInputElement).value;
    return text.trim().length > 0 ? text : undefined;
}
(document.getElementById('SearchInput') as HTMLInputElement).value =
    (localStorage.getItem('searchInput') as string) ?? '';

let count = 0;

console.log('console.log from main.tsx');

function authenticate(): void {
    EchoCore.EchoAuthProvider.handleLogin();
}
authenticate();

const logOptions = {
    '': LogLevel.Trace
};

Syncer.configuration.setApiBaseUrl('https://dt-echopedia-api-dev.azurewebsites.net/');
Syncer.configuration.log.setLevels(logOptions);
logging.setLogLevels(logOptions);
const log = logger('Main');

let _selectedOfflineSystem: OfflineSystem | undefined = undefined;
_selectedOfflineSystem = localStorage.getItem('selectedOfflineSystem') as OfflineSystem;
UpdateHtmlSelectedLabel();

async function selectNextOfflineSystem() {
    const all = Object.values(OfflineSystem);
    if (_selectedOfflineSystem === undefined) _selectedOfflineSystem = all[0];
    else if (_selectedOfflineSystem === all[all.length - 1]) _selectedOfflineSystem = undefined;
    else _selectedOfflineSystem = all[all.findIndex((item) => item === _selectedOfflineSystem) + 1];

    localStorage.setItem('selectedOfflineSystem', _selectedOfflineSystem ?? 'all');
    UpdateHtmlSelectedLabel();
}

function UpdateHtmlSelectedLabel() {
    const selected = _selectedOfflineSystem?.toString() ?? 'all';
    const label = document.getElementById('SelectedButton');
    if (label) label.innerHTML = 'Selected:' + selected;
}

function isSelected(key: OfflineSystem) {
    return _selectedOfflineSystem === undefined || _selectedOfflineSystem === key;
}

async function runSyncTagsClicked() {
    const result = await Syncer.runSyncAsync(OfflineSystem.Tags);
    log.info(result);
    log.info('with pretext', result);
}

async function runSyncAllClicked() {
    const keys = Object.values(OfflineSystem).filter((key) => isSelected(key) && key !== OfflineSystem.Tags);
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
        await Syncer.setEnabledAsync(offlineSystemKey, isEnabled);
    }
}

async function cancelAllClicked() {
    log.info('CancelBtnClicked', count++);
    for (const key in OfflineSystem) {
        if (isSelected(key as OfflineSystem)) echoSearchWorker.cancelSync(key as OfflineSystem);
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

async function searchBtnClicked() {
    localStorage.setItem('searchInput', getSearchInput() ?? '');
    if (isSelected(OfflineSystem.Tags)) {
        try {
            const tagSearchText = getSearchInput() ?? 'a73 pedes cran';
            const tags = await Search.Tags.searchAsync(tagSearchText, 5, undefined, 'L.O265C.001');
            if (tags.values.length === 0) log.info(tagSearchText, "- didn't find anything'");

            print('tags', tags, (item) => [item.tagNo, item.description, item.projectCode]);
        } catch (e) {
            console.log('caught in main raw', e);
            console.log('with properties parsed:', JSON.parse(JSON.stringify(e)));
        }
    }

    if (isSelected(OfflineSystem.Documents)) {
        const documents = await Search.Documents.searchAsync(getSearchInput() ?? 'USER MANUAL', 2);
        print('documents', documents, (item) => [item.docNo, item.docTitle, item.projectCode]);
    }

    if (isSelected(OfflineSystem.McPack)) {
        const filter: Filter<McPackDto> = { projectName: 'L.O265C.001' };
        const mcPacks = await Search.McPacks.searchAsync('0001-A01', 2, filter);
        print('mcPacks', mcPacks, (item) => [item.description, item.commPkgNo, item.mcPkgNo, item.projectName]);
    }

    if (isSelected(OfflineSystem.CommPack)) {
        const commPacks = await Search.CommPacks.searchAsync(getSearchInput() ?? 'A-73MA001', 2);
        print('commPacks', commPacks, (item) => [item.commPkgNo, item.description]);
    }

    if (isSelected(OfflineSystem.Punches)) {
        const punches = await Search.Punch.searchAsync(getSearchInput() ?? 'A-73MA001', 2);
        print('punches', punches, (i) => [i.id, i.description, i.tagNo, i.commPkgNo, i.mcPkgNo, i.updatedAt]);
    }
    if (isSelected(OfflineSystem.Checklist)) {
        const checklists = getSearchInput()
            ? await Search.Checklists.searchAsync(getSearchInput(), undefined, undefined, undefined, 5)
            : await Search.Checklists.searchAsync('A-73MA001', '7302-A01', '7302-R001', 'L.O265C.001', 5);
        print('checklists', checklists, (i) => [
            i.id,
            i.formTypeDescription,
            i.tagNo,
            i.commPackNo,
            i.mcPackNo,
            i.tagProjectName
        ]);

        const checklistsLookup = await Search.Checklists.getAllAsync(checklists.values.map((c) => c.id));
        print('checklists lookup', checklistsLookup, (i) => [i.id, i.formTypeDescription, i.tagNo]);
    }

    if (isSelected(OfflineSystem.Notifications)) {
        const notifications = await Search.Notifications.searchAsync(getSearchInput() ?? 'A-73MA001', 2);
        print('notifications', notifications, (i) => [i.maintenanceRecordId, i.title, i.tagId, i.wbsId, i.wbs]);
        const recordLookup = await Search.Notifications.getAsync(notifications.values[0]?.maintenanceRecordId ?? '123');
        console.log('Record lookup', recordLookup);
    }
    if (isSelected(OfflineSystem.WorkOrders)) {
        const workOrders = await Search.WorkOrders.searchAsync(getSearchInput() ?? 'A-73MA001', 2);
        print('workOrders', workOrders, (i) => [i.workOrderId, i.title, i.tagId]);
        const workOrdersLookup = await Search.WorkOrders.getAsync(workOrders.values[0]?.workOrderId ?? '123');
        console.log('WorkOrders lookup', workOrdersLookup);
    }
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

function print<T>(
    name: string,
    searchResults: ResultArray<T>,
    valuesToPrint: (item: T) => (string | number | Date | undefined)[]
): void {
    if (searchResults.isSuccess) {
        console.log(
            name,
            'search',
            searchResults.values.map((item) => valuesToPrint(item).join(' '))
        );
    } else {
        console.log(name, 'search error ', searchResults.error?.message?.toString());
    }
}

async function handleClick(): Promise<void> {
    selectNextOfflineSystem();
    console.log('Selected', _selectedOfflineSystem ?? 'all');

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
