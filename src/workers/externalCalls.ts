import { NotFoundError } from '@equinor/echo-base';
import { logger } from '../logger';
import { ApiFetchState, defaultFailureRate, FailureRate } from '../offlineSync/apiDataFetcher';
import { checklistsApi } from '../offlineSync/checklistsSyncer/checklistsApi';
import { checklistsSyncSystem } from '../offlineSync/checklistsSyncer/checklistsSyncer';
import { commPacksApi } from '../offlineSync/commPacksSyncer/commPacksApi';
import { commPacksSyncSystem } from '../offlineSync/commPacksSyncer/commPacksSyncer';
import { documentsApi } from '../offlineSync/documentsSyncer/documentsApi';
import { documentsSyncSystem } from '../offlineSync/documentsSyncer/documentsSyncer';
import { mcPacksApi } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { mcPacksSyncSystem } from '../offlineSync/mcPacksSyncer/mcPacksSyncer';
import { notificationsApi } from '../offlineSync/notificationSyncer/notificationApi';
import { notificationsSyncSystem } from '../offlineSync/notificationSyncer/notificationSyncer';
import { OfflineSystem } from '../offlineSync/offlineSystem';
import { punchesApi } from '../offlineSync/punchSyncer/punchApi';
import { punchesSyncSystem } from '../offlineSync/punchSyncer/punchSyncer';
import { runSync } from '../offlineSync/syncRunner';
import { Settings } from '../offlineSync/syncSettings';
import { tagsApi } from '../offlineSync/tagSyncer/tagApi';
import { tagsSyncSystem } from '../offlineSync/tagSyncer/tagSyncer';
import { workOrdersApi } from '../offlineSync/workOrdersSyncer/workOrdersApi';
import { workOrdersSyncSystem } from '../offlineSync/workOrdersSyncer/workOrdersSyncer';
import { Result } from '../results/baseResult';
import { result } from '../results/createResult';
import { NotImplementedError } from '../results/errors';
import { externalChecklists } from './externalChecklists';
import { externalCommPacks } from './externalCommPacks';
import { externalDocuments } from './externalDocuments';
import { externalMcPacks } from './externalMcPacks';
import { externalNotifications } from './externalNotifications';
import { externalPunches } from './externalPunches';
import { externalTags } from './externalTags';
import { externalWorkOrders } from './externalWorkOrders';
import { SyncSystem } from './syncSystem';

const log = logger('externalCalls');
/**
let _counter = 0;
function functionShouldOnlyBeCalledOnce(): void {
    log.error('--called once only?? no :( counter should increase if its same instance of file..', _counter++);
}
functionShouldOnlyBeCalledOnce();
*/

let _initDone = false;
let _initTaskInstance: Promise<Result> | undefined = undefined;

let _loadOfflineSettingsTask: Promise<void> | undefined = undefined;
async function loadOfflineSettingsTask(): Promise<void> {
    if (!_loadOfflineSettingsTask) _loadOfflineSettingsTask = Settings.loadOfflineSettings();
    return _loadOfflineSettingsTask;
}

function allSyncSystems() {
    return [
        tagsSyncSystem,
        documentsSyncSystem,
        notificationsSyncSystem,
        punchesSyncSystem,
        mcPacksSyncSystem,
        commPacksSyncSystem,
        checklistsSyncSystem,
        workOrdersSyncSystem
    ];
}

export async function externalInitializeTask(): Promise<Result> {
    // const wait = (ms) => new Promise((res) => setTimeout(res, ms));
    // const p1 = new Promise((res) => setTimeout(() => res('p1'), 1000));
    // const p2 = new Promise((res) => setTimeout(() => res('p2'), 500));
    // const result = await Promise.race([p1, p2]);

    if (!_initTaskInstance) _initTaskInstance = internalInitialize();
    return _initTaskInstance;
}

async function internalInitialize(): Promise<Result> {
    if (_initDone) {
        log.warn('internalInitialize already done, returning');
        return result.success();
    }

    const performanceLogger = log.performance();
    performanceLogger.forceLog('----------- Search module init START -----------');

    await loadOfflineSettingsTask();
    performanceLogger.forceLogDelta('Loaded Offline Settings 11');

    const initCommTask = externalCommPacks.initTask();
    const initMcTask = externalMcPacks.initTask();
    const initTagsTask = externalTags.initTagsTask();
    const initDocumentsTasks = externalDocuments.initTask();
    const initPunchesTask = externalPunches.initTask();
    const initNotificationTask = externalNotifications.initTask();
    const initChecklistsTask = externalChecklists.initTask();
    const initWorkOrdersTask = externalWorkOrders.initTask();

    await Promise.all([
        initMcTask,
        initCommTask,
        initPunchesTask,
        initTagsTask,
        initDocumentsTasks,
        initNotificationTask,
        initChecklistsTask,
        initWorkOrdersTask
    ]);
    performanceLogger.forceLog('----------- Search module initialize done -----------');
    _initDone = true;
    return result.success();
}

async function externalRunSync(offlineSystemKey: OfflineSystem): Promise<Result> {
    await loadOfflineSettingsTask(); //in case init is not done yet

    const system: SyncSystem<unknown> | undefined = getSyncSystem(offlineSystemKey);
    if (system) return await runSync(system);

    return result.notImplementedError('externalRunSync not implemented for ' + offlineSystemKey);
}

async function externalSetEnabled(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<Result> {
    const syncSystem = getSyncSystem(offlineSystemKey);
    if (!syncSystem) return result.notImplementedError('SetEnabled not implemented for ' + offlineSystemKey);

    syncSystem.setIsEnabled(isEnabled);
    return result.success();
}

async function externalCancelSync(offlineSystemKey: OfflineSystem): Promise<Result> {
    const syncSystem = getSyncSystem(offlineSystemKey);
    if (!syncSystem) throw new NotImplementedError('cancel not implemented for ' + offlineSystemKey);

    syncSystem.cancelSync();
    log.create(offlineSystemKey).trace('Sync canceled done');
    return result.success();
}

const cancelSyncAll = () => allSyncSystems().forEach((item) => item.cancelSync());

function getSyncSystem(offlineSystemKey: OfflineSystem) {
    return allSyncSystems().find((item) => item.offlineSystemKey === offlineSystemKey);
}

function externalToggleMockData(): void {
    mcPacksApi.state.toggleMock();
    commPacksApi.state.toggleMock();
    punchesApi.state.toggleMock();
    checklistsApi.state.toggleMock();
    tagsApi.state.toggleMock();
    documentsApi.state.toggleMock();
    notificationsApi.state.toggleMock();
    notificationsApi.state.failureRate.percentage = 30;
    workOrdersApi.state.toggleMock();

    log.info(
        'use mock tags:',
        tagsApi.state.isMockEnabled,
        'mcPacks',
        mcPacksApi.state.isMockEnabled,
        'punches',
        punchesApi.state.isMockEnabled,
        'checklists',
        checklistsApi.state.isMockEnabled,
        'notifications',
        notificationsApi.state.isMockEnabled,
        'notifications failureRate',
        notificationsApi.state.failureRate.percentage,
        'workOrders',
        workOrdersApi.state.isMockEnabled
    );
}

function getApiState(key: OfflineSystem): ApiFetchState | undefined {
    switch (key) {
        case OfflineSystem.Tags:
            return tagsApi.state;
        case OfflineSystem.Documents:
            return documentsApi.state;
        case OfflineSystem.CommPack:
            return commPacksApi.state;
        case OfflineSystem.McPack:
            return mcPacksApi.state;
        case OfflineSystem.Punches:
            return punchesApi.state;
        case OfflineSystem.Checklist:
            return checklistsApi.state;
        case OfflineSystem.Notifications:
            return notificationsApi.state;
        case OfflineSystem.WorkOrders:
            return workOrdersApi.state;
        // default:
        //     break;
    }
    // return undefined;
}

async function resetDebugOptions(): Promise<void> {
    const all = Object.values(OfflineSystem);

    for (const key of all) {
        const state = getApiState(key);
        if (state) {
            state.failureRate.percentage = 0;
            state.isMockEnabled = false;
        }
    }
}

async function setMockEnabled(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<void> {
    const apiState = getApiState(offlineSystemKey);
    if (apiState) apiState.isMockEnabled = isEnabled;
    else log.warn(`Set mock data not implemented for ${offlineSystemKey}`);
}

async function isMockEnabled(offlineSystemKey: OfflineSystem): Promise<boolean> {
    const apiState = getApiState(offlineSystemKey);
    if (apiState) return apiState.isMockEnabled;
    else log.warn(`Is mock data enabled not implemented for ${offlineSystemKey}`);
    return false;
}

async function setFailureRate(offlineSystemKey: OfflineSystem, failureRate: FailureRate): Promise<void> {
    const apiState = getApiState(offlineSystemKey);
    if (!apiState) {
        log.warn(`Set failure rate not implemented for ${offlineSystemKey}`);
        return;
    }
    apiState.failureRate = failureRate;
}

async function getFailureRate(offlineSystemKey: OfflineSystem): Promise<FailureRate> {
    const apiState = getApiState(offlineSystemKey);
    if (apiState) return apiState.failureRate;
    else log.warn(`Set failure rate not implemented for ${offlineSystemKey}`);
    return defaultFailureRate;
}

async function externalChangePlant(instCode: string, forceDeleteIfSameAlreadySelected = false): Promise<Result> {
    if (!forceDeleteIfSameAlreadySelected && (await Settings.getInstCodeOrUndefinedAsync()) === instCode)
        return result.success();

    cancelSyncAll();
    const settingsState = Settings.all();
    await Settings.saveInstCode(instCode);
    await syncContract.externalDeleteAllData();
    settingsState.forEach((setting) => {
        Settings.setIsSyncEnabled(setting.offlineSystemKey, setting.isEnabled);
    });

    return result.success();
}

async function externalDeleteAllData(): Promise<void> {
    const performanceLogger = log.performance('..Delete All Data');
    performanceLogger.forceLog(' - Started');
    cancelSyncAll();

    const all = allSyncSystems();
    await Promise.all(all.map(async (item) => await item.clearAllData()));

    performanceLogger.forceLog(' - Done');
}

export const syncContract = {
    externalDeleteAllData,
    externalCancelSync,
    isEnabled: (offlineSystemKey: OfflineSystem): boolean => Settings.isSyncEnabled(offlineSystemKey),
    externalSetEnabled,
    externalRunSync,
    externalChangePlant,

    externalToggleMockData,
    isMockEnabled,
    setMockEnabled,
    setFailureRate,
    getFailureRate,
    resetDebugOptions
};

export function externalTestCommReturnTypes(): ErrorForTesting {
    const err = new NotFoundError({
        message: 'a message',
        httpStatusCode: 404,
        url: 'https://',
        exception: { aTestProp: 'value 1' }
    });

    console.log("error'en", { ...err });

    const moreProps = Object.entries(err).filter((item) => typeof item[1] !== 'function');
    const recordsProp: Record<string, unknown> = {};
    for (const prop of moreProps) {
        recordsProp[prop[0]] = prop[1];
    }
    console.log(recordsProp);

    for (const prop of moreProps) {
        console.log(prop, typeof prop[1]);
    }

    const temp: ErrorForTesting = { type: ErrorType.ApiNotFound, ...recordsProp };
    console.log('tempppppp', temp);

    return {
        message: err.message,
        name: err.name,
        httpStatusCode: 404,
        url: err.getUrl(),
        properties: { ...moreProps },
        type: ErrorType.ApiNotFound,
        stack: err.stack
    };
}

export enum ErrorType {
    ApiNotFound = 'ApiNotFound'
}

export interface ErrorForTesting {
    type: ErrorType;
    name?: string;
    message?: string;
    stack?: string;
    httpStatusCode?: number;
    url?: string;
    properties?: Record<string, unknown>;
}
