import { ApiDataFetcher } from '../apiDataFetcher';
import { queryParameter } from '../apiHelper';
import { orEmpty, toDateOrThrowError, toNumber } from '../stringUtils';
import { baseApiUrl, Settings } from '../syncSettings';
import { dateAsApiString } from '../Utils/stringUtils';
import { getMockedMcPacksString } from './mcPacksMocked';

// keep const log = loggerFactory.mcPacks('Api');
const mcPacksApiFetcher = new ApiDataFetcher(cleanupMcPack);

export const mcPacksApi = {
    all: apiAllMcPacks,
    updated: apiUpdatedMcPacks,
    search: apiSearchMcPacks,
    state: mcPacksApiFetcher.state
};

export interface McPackDb {
    readonly id: number;
    readonly commPkgNo: string;
    readonly description: string;
    readonly mcPkgNo: string;
    readonly projectName: string;
    readonly updatedAt: Date;
}

function cleanupMcPack(mcPack: McPackDb): McPackDb {
    return {
        id: toNumber(mcPack.id),
        commPkgNo: orEmpty(mcPack.commPkgNo),
        description: orEmpty(mcPack.description),
        mcPkgNo: orEmpty(mcPack.mcPkgNo),
        projectName: orEmpty(mcPack.projectName),
        updatedAt: toDateOrThrowError(mcPack.updatedAt)
    };
}

async function apiAllMcPacks(instCode: string, abortSignal: AbortSignal): Promise<McPackDb[]> {
    const url = `${baseApiUrl}/${instCode}/mcPks?paging=false`;
    return mcPacksApiFetcher.fetchAll(url, () => getMockedMcPacksString(0), abortSignal);
}

async function apiUpdatedMcPacks(instCode: string, fromDate: Date, abortSignal: AbortSignal): Promise<McPackDb[]> {
    const date = dateAsApiString(fromDate);
    const url = `${baseApiUrl}/${instCode}/mcPks?updatedSince=${date}&paging=false`;
    return mcPacksApiFetcher.fetchAll(url, () => getMockedMcPacksString(50000), abortSignal);
}

async function apiSearchMcPacks(
    searchText: string,
    maxHits: number,
    instCode?: string,
    projectCode?: string,
    abortSignal?: AbortSignal
): Promise<McPackDb[]> {
    instCode = instCode ?? Settings.getInstCode();
    let url = `${baseApiUrl}/${instCode}/mcPks`;
    url += queryParameter('containsText', searchText, '?');
    url += queryParameter('projectCodeContains', projectCode);
    url += queryParameter('itemsPerPage', maxHits);
    return mcPacksApiFetcher.fetchAll(url, () => getMockedMcPacksString(100), abortSignal);
}
