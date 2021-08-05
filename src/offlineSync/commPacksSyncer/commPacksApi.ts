import { apiFetchJsonToArray } from '../../service/workerFetch';
import { ApiDataFetcher } from '../apiDataFetcher';
import { queryParameter } from '../apiHelper';
import { orEmpty, toDateOrThrowError, toNumber } from '../stringUtils';
import { getApiBaseUrl, Settings } from '../syncSettings';
import { dateAsApiString } from '../Utils/stringUtils';
import { getMockedCommPacksString } from './commPacksMocked';

// keep const log = loggerFactory.commPacks('Api');
const commPacksApiFetcher = new ApiDataFetcher(cleanupCommPack);

export const commPacksApi = {
    all: apiAllCommPacks,
    updated: apiUpdatedCommPacks,
    allCommPackNos: apiAllCommPackNos,
    search: apiSearchCommPacks,
    state: commPacksApiFetcher.state
};

export interface CommPackDb {
    readonly id: number;
    readonly commPkgNo: string;
    readonly description: string;
    readonly projectName: string;
    readonly operationHandoverStatus: number;
    readonly commissioningHandoverStatus: number;
    readonly updatedAt: Date;
}

function cleanupCommPack(commPack: CommPackDb): CommPackDb {
    return {
        id: toNumber(commPack.id),
        commPkgNo: orEmpty(commPack.commPkgNo),
        description: orEmpty(commPack.description),
        projectName: orEmpty(commPack.projectName),
        operationHandoverStatus: commPack.operationHandoverStatus,
        commissioningHandoverStatus: commPack.commissioningHandoverStatus,
        updatedAt: toDateOrThrowError(commPack.updatedAt)
    };
}

async function apiAllCommPacks(instCode: string, abortSignal: AbortSignal): Promise<CommPackDb[]> {
    const url = `${getApiBaseUrl()}/${instCode}/commPks?paging=false`;
    return commPacksApiFetcher.fetchAll(url, () => getMockedCommPacksString(0), abortSignal);
}

async function apiUpdatedCommPacks(instCode: string, fromDate: Date, abortSignal: AbortSignal): Promise<CommPackDb[]> {
    const date = dateAsApiString(fromDate);
    const url = `${getApiBaseUrl()}/${instCode}/commPks?updatedSince=${date}&paging=false`;
    return commPacksApiFetcher.fetchAll(url, () => getMockedCommPacksString(50000), abortSignal);
}

async function apiAllCommPackNos(instCode: string, abortSignal: AbortSignal): Promise<string[]> {
    const url = `${getApiBaseUrl()}/${instCode}/commPks?paging=false`;
    const result = await apiFetchJsonToArray<CommPackDb>(url, abortSignal);
    return result.map((i) => i.commPkgNo);
}

async function apiSearchCommPacks(
    searchText: string,
    maxHits: number,
    instCode?: string,
    projectCode?: string,
    abortSignal?: AbortSignal
): Promise<CommPackDb[]> {
    instCode = instCode ?? Settings.getInstCode();
    let url = `${getApiBaseUrl()}/${instCode}/commPks`;
    url += queryParameter('containsText', searchText, '?');
    url += queryParameter('projectCodeContains', projectCode);
    url += queryParameter('itemsPerPage', maxHits);
    return commPacksApiFetcher.fetchAll(url, () => getMockedCommPacksString(100), abortSignal);
}
