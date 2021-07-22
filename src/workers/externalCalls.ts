import { NotFoundError } from '@equinor/echo-base';
import { NotImplementedError, result, Result } from '../baseResult';
import { logger } from '../logger';
import { commPacksApi } from '../offlineSync/commPacksSyncer/commPacksApi';
import { commPacksSyncSystem } from '../offlineSync/commPacksSyncer/commPacksSyncer';
import { mcPacksApi } from '../offlineSync/mcPacksSyncer/mcPacksApi';
import { mcPacksSyncSystem } from '../offlineSync/mcPacksSyncer/mcPacksSyncer';
import { notificationsApi } from '../offlineSync/notificationSyncer/notificationApi';
import { notificationsSyncSystem } from '../offlineSync/notificationSyncer/notificationSyncer';
import { punchesApi } from '../offlineSync/punchSyncer/punchApi';
import { punchesSyncSystem } from '../offlineSync/punchSyncer/punchSyncer';
import { runSync } from '../offlineSync/syncRunner';
import { OfflineSystem, Settings } from '../offlineSync/syncSettings';
import { tagsMock } from '../offlineSync/tagSyncer/tagApi';
import { tagsSyncSystem } from '../offlineSync/tagSyncer/tagSyncer';
import { setToken } from '../tokenHelper';
import { externalCommPacks } from './externalCommPacks';
import { externalMcPacks } from './externalMcPacks';
import { externalNotifications } from './externalNotifications';
import { externalPunches } from './externalPunches';
import { externalTags } from './externalTags';

const log = logger('externalCalls');

//let _counter = 0;
// function functionShouldOnlyBeCalledOnce(): void {
//     log.error('--called once only?? no :( counter should increase if its same instance of file..', _counter++);
// }
// functionShouldOnlyBeCalledOnce();

let _initDone = false;
let _initTaskInstance: Promise<Result> | undefined = undefined;

let _loadOfflineSettingsTask: Promise<void> | undefined = undefined;
async function loadOfflineSettingsTask(): Promise<void> {
    if (!_loadOfflineSettingsTask) _loadOfflineSettingsTask = Settings.loadOfflineSettings();
    return _loadOfflineSettingsTask;
}

function allSyncSystems() {
    return [tagsSyncSystem, notificationsSyncSystem, punchesSyncSystem, mcPacksSyncSystem, commPacksSyncSystem];
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
    // const logOptions = {
    //     '': LogType.Trace
    // };
    // logging.setLogLevels(logOptions); //will be overwritten by external setLogOptions

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
    const initPunchesTask = externalPunches.initTask();
    const initNotificationTask = externalNotifications.initTask();

    await Promise.all([initMcTask, initCommTask, initPunchesTask, initTagsTask, initNotificationTask]);
    performanceLogger.forceLog('----------- Search module initialize done -----------');
    _initDone = true;
    return result.success();
}

async function externalRunSync(offlineSystemKey: OfflineSystem, apiAccessToken: string): Promise<Result> {
    await loadOfflineSettingsTask(); //in case init is not done yet

    setToken(apiAccessToken);

    //const system = getSyncSystem(offlineSystemKey); //TODO Ask Chris - why is this not working?
    //if (system) return await runSync(system);

    if (offlineSystemKey === OfflineSystem.McPack) {
        return await runSync(mcPacksSyncSystem);
    } else if (offlineSystemKey === OfflineSystem.CommPack) {
        return await runSync(commPacksSyncSystem);
    } else if (offlineSystemKey === OfflineSystem.Tags) {
        return await runSync(tagsSyncSystem);
    } else if (offlineSystemKey === OfflineSystem.Punches) {
        return await runSync(punchesSyncSystem);
    } else if (offlineSystemKey === OfflineSystem.Notifications) {
        return await runSync(notificationsSyncSystem);
    }
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
    tagsMock.toggle();
    notificationsApi.state.toggleMock();
    notificationsApi.state.failureRate = 30;

    log.info(
        'use mock tags:',
        tagsMock.isEnabled,
        'mcPacks',
        mcPacksApi.state.isMockEnabled,
        'punches',
        punchesApi.state.isMockEnabled,
        'notifications',
        notificationsApi.state.isMockEnabled,
        'notifications failureRate',
        notificationsApi.state.failureRate
    );
}

async function externalSetFailureRate(offlineSystemKey: OfflineSystem, failPercentage: number): Promise<void> {
    if (offlineSystemKey === OfflineSystem.McPack) mcPacksApi.state.failureRate = failPercentage;
    if (offlineSystemKey === OfflineSystem.CommPack) commPacksApi.state.failureRate = failPercentage;
    if (offlineSystemKey === OfflineSystem.Punches) punchesApi.state.failureRate = failPercentage;
    if (offlineSystemKey === OfflineSystem.Notifications) notificationsApi.state.failureRate = failPercentage;
    else log.warn(`externalSetFailureRateAsync not implemented for ${offlineSystemKey}`);
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
    externalToggleMockData,
    externalChangePlant,
    externalSetFailureRate
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
