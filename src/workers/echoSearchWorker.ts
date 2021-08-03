import * as Comlink from 'comlink';
import { CommPackDto, McPackDto, NotificationDto, PunchDto, TagSummaryDto } from '..';
import { result, Result, ResultValue } from '../baseResult';
import { Filter } from '../inMemory/searchFilter';
import { SearchResult, SearchResults } from '../inMemory/searchResult';
import { logger } from '../logger';
import { logging, LogOptions, LogType } from '../loggerOptions';
import { DocumentSummaryKey } from '../offlineSync/documentsSyncer/documentDb';
import { OfflineSystem, Settings } from '../offlineSync/syncSettings';
import { createFakeDatabases } from '../offlineSync/tagSyncer/tagRepository';
import ctx from '../setup/setup';
import { setTokenGetterInWorker } from '../workerTokenHelper';
import { DocumentSummaryDto } from './dataTypes';
import { externalInitializeTask, externalTestCommReturnTypes, syncContract } from './externalCalls';
import { externalCommPacks } from './externalCommPacks';
import { externalDocuments } from './externalDocuments';
import { externalMcPacks } from './externalMcPacks';
import { externalNotifications } from './externalNotifications';
import { externalPunches } from './externalPunches';
import { externalTags } from './externalTags';

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

    searchTags(searchText: string, maxHits: number): Promise<SearchResults<TagSummaryDto>>;
    searchForClosestTagNo(tagNo: string): Promise<SearchResult<string>>;
    lookupTagAsync(tagNo: string): Promise<SearchResult<TagSummaryDto>>;
    lookupTagsAsync(tagNos: string[]): Promise<SearchResults<TagSummaryDto>>;

    searchDocumentsAsync(
        searchText: string,
        maxHits: number,
        tryToApplyFilter?: Filter<DocumentSummaryDto>
    ): Promise<SearchResults<DocumentSummaryDto>>;
    lookupDocumentAsync(id: DocumentSummaryKey): Promise<SearchResult<DocumentSummaryDto>>;
    lookupAllDocumentsAsync(ids: DocumentSummaryKey[]): Promise<SearchResults<DocumentSummaryDto>>;

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
    ): Promise<SearchResults<McPackDto>>;
    lookupMcPackAsync(tagNo: number): Promise<SearchResult<McPackDto>>;
    lookupMcPacksAsync(tagNos: number[]): Promise<SearchResults<McPackDto>>;

    searchCommPacks(
        searchText: string,
        maxHits: number,
        tryToApplyFilter?: Filter<CommPackDto>
    ): Promise<SearchResults<CommPackDto>>;
    lookupCommPackAsync(tagNo: number): Promise<SearchResult<CommPackDto>>;
    lookupCommPacksAsync(tagNos: number[]): Promise<SearchResults<CommPackDto>>;

    searchPunches(
        searchText: string,
        maxHits: number,
        tryToApplyFilter?: Filter<PunchDto>
    ): Promise<SearchResults<PunchDto>>;
    lookupPunchAsync(tagNo: string): Promise<SearchResult<PunchDto>>;
    lookupPunchesAsync(tagNos: string[]): Promise<SearchResults<PunchDto>>;

    searchNotifications(
        searchText: string,
        maxHits: number,
        tryToApplyFilter?: Filter<PunchDto>
    ): Promise<SearchResults<NotificationDto>>;
    searchNotificationsByTagNos(tagNos: string[]): Promise<SearchResults<NotificationDto>>;

    lookupNotificationAsync(maintenanceRecordId: string): Promise<SearchResult<NotificationDto>>;
    lookupNotificationsAsync(maintenanceRecordIds: string[]): Promise<SearchResults<NotificationDto>>;

    runSyncWorkerAsync(offlineSystemKey: OfflineSystem): Promise<Result>;

    setEnabledAsync(offlineSystemKey: OfflineSystem, isEnabled: boolean): Promise<Result>;
    isEnabledAsync(offlineSystemKey: OfflineSystem): Promise<ResultValue<boolean>>;

    setFailureRateAsync(offlineSystemKey: OfflineSystem, failPercentage: number): Promise<void>;

    cancelSync(offlineSystemKey: OfflineSystem): void;
    runExpensive: () => string;

    doStuff2(): Promise<void>;
    toggleMockDataClicked(): void;
    testCommReturnTypes(): unknown;

    setLogLevel: (context: string, logTypeLevel: LogType) => void;
    setLogLevels: (logLevels: LogOptions) => void;
    setDefaultLogLevel: (defaultLogLevel: LogType) => void;
    getDefaultLogLevel: () => LogType;
    getLogLevel: (context: string) => LogType;
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
        log.warn(error);
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
    lookupPunchAsync: (...args) => tryCatchToResult(() => externalPunches.lookup(...args)),
    lookupPunchesAsync: (...args) => tryCatchToResult(() => externalPunches.lookupAll(...args)),

    searchNotifications: (...args) => tryCatchToResult(() => externalNotifications.search(...args)),
    searchNotificationsByTagNos: (...args) => tryCatchToResult(() => externalNotifications.searchByTagNos(...args)),
    lookupNotificationAsync: (...args) => tryCatchToResult(() => externalNotifications.lookup(...args)),
    lookupNotificationsAsync: (...args) => tryCatchToResult(() => externalNotifications.lookupAll(...args)),

    changePlantAsync: (...args) => tryCatchToResult(() => syncContract.externalChangePlant(...args)),
    runSyncWorkerAsync: (...args) => tryCatchToResult(() => syncContract.externalRunSync(...args)),
    cancelSync: (...args) => tryCatchToResult(() => syncContract.externalCancelSync(...args)),
    setEnabledAsync: (...args) => tryCatchToResult(() => syncContract.externalSetEnabled(...args)),
    isEnabledAsync: async (...args) =>
        tryCatchToResult(async () => result.valueSuccess(syncContract.isEnabled(...args))),

    setFailureRateAsync: (...args) => syncContract.externalSetFailureRate(...args),

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
