import { ApiDataFetcher } from '../apiDataFetcher';
import { orEmpty, toDateOrThrowError, toNumber } from '../stringUtils';
import { baseApiUrl } from '../syncSettings';
import { dateAsApiString } from '../Utils/stringUtils';
import { getMockedMcPacksString } from './mcPacksMocked';

// keep const log = loggerFactory.mcPacks('Api');
export const mcPacksApi = new ApiDataFetcher(cleanupMcPack);

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

export async function apiAllMcPacks(instCode: string, abortSignal: AbortSignal): Promise<McPackDb[]> {
    const url = `${baseApiUrl}/${instCode}/mcPks?paging=false`;
    return mcPacksApi.fetchAll(url, abortSignal, () => getMockedMcPacksString(0));
}

export async function apiUpdatedMcPacks(
    instCode: string,
    fromDate: Date,
    abortSignal: AbortSignal
): Promise<McPackDb[]> {
    const date = dateAsApiString(fromDate);
    const url = `${baseApiUrl}/${instCode}/mcPks?updatedSince=${date}&paging=false`;
    return mcPacksApi.fetchAll(url, abortSignal, () => getMockedMcPacksString(50000));
}
