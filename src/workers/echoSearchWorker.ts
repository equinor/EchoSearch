import * as Comlink from 'comlink';
import { Dictionary } from 'lodash';
import { Filter } from '../inMemory/searchFilter';
import { logger } from '../logger';
import { logging, LogLevel, LogOptions } from '../loggerOptions';
import { FailureRate } from '../offlineSync/apiDataFetcher';
import { DocumentSummaryKey } from '../offlineSync/documentsSyncer/documentDb';
import { OfflineSystem } from '../offlineSync/offlineSystem';
import { Settings } from '../offlineSync/syncSettings';
import { createFakeDatabases } from '../offlineSync/tagSyncer/tagRepository';
import { Result, ResultArray, ResultValue } from '../results/baseResult';
import { result, resultValue } from '../results/createResult';
import ctx from '../setup/setup';
import { setTokenGetterInWorker } from '../workerTokenHelper';
import {
    ChecklistDto,
    CommPackDto,
    DocumentSummaryDto,
    McPackDto,
    NotificationDto,
    PunchDto,
    TagSummaryDto,
    WorkOrderDto
} from './dataTypes';
import { externalInitializeTask, externalTestCommReturnTypes, syncContract } from './externalCalls';
import { externalChecklists } from './externalChecklists';
import { externalCommPacks } from './externalCommPacks';
import { externalDocuments } from './externalDocuments';
import { externalMcPacks } from './externalMcPacks';
import { externalNotifications } from './externalNotifications';
import { externalPunches } from './externalPunches';
import { externalTags } from './externalTags';
import { externalWorkOrders } from './externalWorkOrders';

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

interface AnotherI {
    hello: (arg: string) => string;
}

const hello: AnotherI = {
    hello: (arg: string) => 'hello ' + arg
};

const log = logger('EchoSearchWorker');

export const sleep = (ms: number): Promise<unknown> => new Promise((res) => setTimeout(res, ms));

export interface EchoWorker {
    initialize(): Promise<Result>;
    changePlantAsync(instCode: string, forceDeleteIfSameAlreadySelected: boolean): Promise<Result>;

    searchTags(searchText: string, maxHits: number): Promise<ResultArray<TagSummaryDto>>;
    searchForClosestTagNo(tagNo: string): Promise<ResultValue<string>>;
    lookupTagAsync(tagNo: string): Promise<ResultValue<TagSummaryDto>>;
    lookupTagsAsync(tagNos: string[]): Promise<ResultArray<TagSummaryDto>>;

    searchDocumentsAsync(
        searchText: string,
        maxHits: number,
        tryToApplyFilter?: Filter<DocumentSummaryDto>
    ): Promise<ResultArray<DocumentSummaryDto>>;
    lookupDocumentAsync(id: DocumentSummaryKey): Promise<ResultValue<DocumentSummaryDto>>;
    lookupAllDocumentsAsync(ids: DocumentSummaryKey[]): Promise<ResultArray<DocumentSummaryDto>>;

    /**
     * Search for mcPacks. Uses Offline search, except when it's syncing all items the first time.
     * @param searchText The text to search for.
     * @param maxHits Max hits to return. May return more than if online search, since we do multiple searches online, and can't determine the best hits properly.
     * @param tryToApplyFilter Applies the filter fully if offline Search. Applies the filter partially if online-search (projectCode).
     */
    searchMcPacks(
        searchText: string,
        maxHits: number,
        tryToApplyFilter?: Filter<McPackDto>
    ): Promise<ResultArray<McPackDto>>;
    lookupMcPackAsync(tagNo: number): Promise<ResultValue<McPackDto>>;
    lookupMcPacksAsync(tagNos: number[]): Promise<ResultArray<McPackDto>>;

    searchCommPacks(
        searchText: string,
        maxHits: number,
        tryToApplyFilter?: Filter<CommPackDto>
    ): Promise<ResultArray<CommPackDto>>;
    lookupCommPackAsync(tagNo: number): Promise<ResultValue<CommPackDto>>;
    lookupCommPacksAsync(tagNos: number[]): Promise<ResultArray<CommPackDto>>;

    searchPunches(
        searchText: string,
        maxHits: number,
        tryToApplyFilter?: Filter<PunchDto>
    ): Promise<ResultArray<PunchDto>>;
    searchPunchesByTagNo(tagNos: string, tryToApplyFilter?: Filter<PunchDto>): Promise<ResultArray<PunchDto>>;
    lookupPunchAsync(tagNo: string): Promise<ResultValue<PunchDto>>;
    lookupPunchesAsync(tagNos: string[]): Promise<ResultArray<PunchDto>>;

    searchChecklists(
        tagNo?: string,
        commPackNo?: string,
        mcPackNo?: string,
        tagProjectName?: string,
        maxHits?: number
    ): Promise<ResultArray<ChecklistDto>>;
    lookupChecklistAsync(id: number): Promise<ResultValue<ChecklistDto>>;
    lookupChecklistsAsync(ids: number[]): Promise<ResultArray<ChecklistDto>>;
    lookupGroupByTagNosAsync(tagNos: string[]): Promise<ResultValue<Dictionary<ChecklistDto[]>>>;

    searchNotifications(
        searchText: string,
        maxHits: number,
        tryToApplyFilter?: Filter<NotificationDto>
    ): Promise<ResultArray<NotificationDto>>;
    searchNotificationsByTagNos(tagNos: string[]): Promise<ResultArray<NotificationDto>>;

    lookupNotificationAsync(maintenanceRecordId: string): Promise<ResultValue<NotificationDto>>;
    lookupNotificationsAsync(maintenanceRecordIds: string[]): Promise<ResultArray<NotificationDto>>;

    searchWorkOrders(
        searchText: string,
        maxHits: number,
        tryToApplyFilter?: Filter<WorkOrderDto>
    ): Promise<ResultArray<WorkOrderDto>>;
    searchWorkOrdersByTagNos(tagNos: string[]): Promise<ResultArray<WorkOrderDto>>;

    lookupWorkOrderAsync(workOrderId: string): Promise<ResultValue<WorkOrderDto>>;
    lookupWorkOrdersAsync(workOrderIds: string[]): Promise<ResultArray<WorkOrderDto>>;

    runSyncWorkerAsync(offlineSystemKey: OfflineSystem): Promise<Result>;

    setEnabledAsync(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<Result>;
    isEnabledAsync(offlineSystemKey: OfflineSystem): Promise<ResultValue<boolean>>;

    setFailureRateAsync(offlineSystemKey: OfflineSystem, failureRate: FailureRate): Promise<void>;
    getFailureRateAsync(offlineSystemKey: OfflineSystem): Promise<FailureRate>;
    setMockEnabledAsync(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<void>;
    isMockEnabledAsync(offlineSystemKey: OfflineSystem): Promise<boolean>;
    resetDebugOptionsAsync(): Promise<void>;

    cancelSync(offlineSystemKey: OfflineSystem): void;
    runExpensive: () => string;

    doStuff2(): Promise<void>;
    toggleMockDataClicked(): void;
    testCommReturnTypes(): unknown;

    setLogLevel: (context: string, logLevelLevel: LogLevel) => void;
    setLogLevels: (logLevels: LogOptions) => void;
    setDefaultLogLevel: (defaultLogLevel: LogLevel) => void;
    getDefaultLogLevel: () => LogLevel;
    getLogLevel: (context: string) => LogLevel | undefined;
    setApiBaseUrl(baseUrl: string): void;

    setTokenCallback(getToken: () => Promise<string>): void;

    anotherHelloNotWorking: AnotherI;
}

async function tryCatchToResult<T extends Result>(func: () => Promise<T>): Promise<T> {
    try {
        const funcResult = await func();
        if (!funcResult.isSuccess) log.debug('Error:', funcResult.error);
        return funcResult;
    } catch (error) {
        log.warn('we caught an error: ', error);
        return result.errorFromException(error) as T;
    }
}

const echoWorker: EchoWorker = {
    initialize: (...args) => tryCatchToResult(() => externalInitializeTask(...args)),

    searchTags: (...args) => tryCatchToResult(() => externalTags.search(...args)),
    searchForClosestTagNo: (...args) => tryCatchToResult(() => externalTags.searchForClosestTagNo(...args)),
    lookupTagAsync: (...args) => tryCatchToResult(() => externalTags.lookup(...args)),
    lookupTagsAsync: (...args) => tryCatchToResult(() => externalTags.lookupAll(...args)),

    searchDocumentsAsync: (...args) => tryCatchToResult(() => externalDocuments.search(...args)),
    lookupDocumentAsync: (...args) => tryCatchToResult(() => externalDocuments.lookup(...args)),
    lookupAllDocumentsAsync: (...args) => tryCatchToResult(() => externalDocuments.lookupAll(...args)),

    searchMcPacks: (...args) => tryCatchToResult(() => externalMcPacks.search(...args)),
    lookupMcPackAsync: (...args) => tryCatchToResult(() => externalMcPacks.lookup(...args)),
    lookupMcPacksAsync: (...args) => tryCatchToResult(() => externalMcPacks.lookupAll(...args)),

    searchCommPacks: (...args) => tryCatchToResult(() => externalCommPacks.search(...args)),
    lookupCommPackAsync: (...args) => tryCatchToResult(() => externalCommPacks.lookup(...args)),
    lookupCommPacksAsync: (...args) => tryCatchToResult(() => externalCommPacks.lookupAll(...args)),

    searchPunches: (...args) => tryCatchToResult(() => externalPunches.search(...args)),
    searchPunchesByTagNo: (...args) => tryCatchToResult(() => externalPunches.searchByTagNo(...args)),
    lookupPunchAsync: (...args) => tryCatchToResult(() => externalPunches.lookup(...args)),
    lookupPunchesAsync: (...args) => tryCatchToResult(() => externalPunches.lookupAll(...args)),

    searchChecklists: (...args) => tryCatchToResult(() => externalChecklists.search(...args)),
    lookupChecklistAsync: (...args) => tryCatchToResult(() => externalChecklists.lookup(...args)),
    lookupChecklistsAsync: (...args) => tryCatchToResult(() => externalChecklists.lookupAll(...args)),
    lookupGroupByTagNosAsync: (...args) => tryCatchToResult(() => externalChecklists.lookupGroupByTagNos(...args)),

    searchNotifications: (...args) => tryCatchToResult(() => externalNotifications.search(...args)),
    searchNotificationsByTagNos: (...args) => tryCatchToResult(() => externalNotifications.searchByTagNos(...args)),
    lookupNotificationAsync: (...args) => tryCatchToResult(() => externalNotifications.lookup(...args)),
    lookupNotificationsAsync: (...args) => tryCatchToResult(() => externalNotifications.lookupAll(...args)),

    searchWorkOrders: (...args) => tryCatchToResult(() => externalWorkOrders.search(...args)),
    searchWorkOrdersByTagNos: (...args) => tryCatchToResult(() => externalWorkOrders.searchByTagNos(...args)),
    lookupWorkOrderAsync: (...args) => tryCatchToResult(() => externalWorkOrders.lookup(...args)),
    lookupWorkOrdersAsync: (...args) => tryCatchToResult(() => externalWorkOrders.lookupAll(...args)),

    changePlantAsync: (...args) => tryCatchToResult(() => syncContract.externalChangePlant(...args)),
    runSyncWorkerAsync: (...args) => tryCatchToResult(() => syncContract.externalRunSync(...args)),
    cancelSync: (...args) => tryCatchToResult(() => syncContract.externalCancelSync(...args)),
    setEnabledAsync: (...args) => tryCatchToResult(() => syncContract.externalSetEnabled(...args)),
    isEnabledAsync: async (...args) =>
        tryCatchToResult(async () => resultValue.successOrNotFound(syncContract.isEnabled(...args))),

    setFailureRateAsync: (...args) => syncContract.setFailureRate(...args), //Ask Chris nested sub types here??
    getFailureRateAsync: (...args) => syncContract.getFailureRate(...args),
    setMockEnabledAsync: (...args) => syncContract.setMockEnabled(...args),
    isMockEnabledAsync: (...args) => syncContract.isMockEnabled(...args),
    resetDebugOptionsAsync: (...args) => syncContract.resetDebugOptions(...args),

    runExpensive(): string {
        expensive(2000);
        return 'done';
    },

    async doStuff2(): Promise<void> {
        createFakeDatabases();
    },

    toggleMockDataClicked(): void {
        syncContract.externalToggleMockData();
    },

    testCommReturnTypes(): unknown {
        const result = externalTestCommReturnTypes();
        console.log('EchoWorker', result);
        console.log('EchoWorker props', { ...result });
        return result;
    },

    setLogLevel: logging.setLogLevel,
    setLogLevels: logging.setLogLevels,
    setDefaultLogLevel: logging.setDefaultLogLevel,
    getDefaultLogLevel: logging.getDefaultLogLevel,
    getLogLevel: logging.getLogLevel,
    setApiBaseUrl: (...args) => Settings.setApiBaseUrl(...args),

    setTokenCallback: Comlink.proxy(setTokenCallback),

    anotherHelloNotWorking: hello
};

async function setTokenCallback(getToken: () => Promise<string>): Promise<void> {
    setTokenGetterInWorker(getToken);
}

//used for debugging in vsCode locally
export const echoWorkerDebugDontUseThis = echoWorker;

Comlink.expose(echoWorker, ctx);
