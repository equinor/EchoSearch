import { logPerformance } from '../../logger';
import { apiFetch } from '../../service/workerFetch';
import { orEmpty, toDateOrThrowError } from '../stringUtils';
import { baseApiUrl } from '../syncSettings';
import { dateAsApiString } from '../Utils/stringUtils';
import { getMockedMcPacksString } from './mcPacksMocked';

const useMockData = true;

export interface McPackDb {
    id: number;
    commPkgNo: string;
    description: string;
    mcPkgNo: string;
    projectName: string;
    updatedAt: Date;
}

function cleanupMcPack(mcPack: McPackDb): McPackDb {
    return {
        id: mcPack.id,
        commPkgNo: orEmpty(mcPack.commPkgNo),
        description: orEmpty(mcPack.description),
        mcPkgNo: orEmpty(mcPack.mcPkgNo),
        projectName: orEmpty(mcPack.projectName),
        updatedAt: toDateOrThrowError(mcPack.updatedAt)
    };
}

export async function apiAllMcPacks(instCode: string): Promise<McPackDb[]> {
    const performanceLogger = logPerformance();
    const items: McPackDb[] = useMockData
        ? JSON.parse(getMockedMcPacksString(0))
        : await getAllMcPacksFromApi(instCode);
    performanceLogger.forceLogDelta(useMockData ? 'Got mocked data' : ' Got api data');

    const results = items.map((item) => cleanupMcPack(item));
    performanceLogger.forceLogDelta('Cleanup mc Packs');
    return results;
}

export async function apiUpdatedMcPacks(instCode: string, fromDate: Date): Promise<McPackDb[]> {
    const items: McPackDb[] = useMockData
        ? JSON.parse(getMockedMcPacksString(50000))
        : await getUpdatedMcPacksFromApi(instCode, fromDate);

    return items.map((item) => cleanupMcPack(item));
}

async function getAllMcPacksFromApi(instCode: string): Promise<McPackDb[]> {
    const url = `${baseApiUrl}/${instCode}/mcPks?paging=false`;
    const result = await apiFetch(url);
    return (await result.json()) as McPackDb[];
}

async function getUpdatedMcPacksFromApi(instCode: string, updatedSince: Date): Promise<McPackDb[]> {
    const date = dateAsApiString(updatedSince);
    const url = `${baseApiUrl}/${instCode}/mcPks?updatedSince=${date}&paging=false`;
    const result = await apiFetch(url);
    return (await result.json()) as McPackDb[];
}
