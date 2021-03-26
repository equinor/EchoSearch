import { logPerformance } from '../../logger';
import { workerFetch } from '../../service/workerFetch';
import { getToken } from '../../tokenHelper';
import { orEmpty } from '../stringUtils';
import { dateAsApiString } from '../Utils/stringUtils';
import { getMockedMcPacksString } from './mcPacksMocked';

const useMockData = false;

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
        updatedAt: mcPack.updatedAt
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
        : await syncMcPacksFromApi(instCode, fromDate);

    return items.map((item) => cleanupMcPack(item));
}

const baseApiUrl = 'https://dt-echopedia-api-dev.azurewebsites.net/';
async function getAllMcPacksFromApi(instCode: string): Promise<McPackDb[]> {
    const url = `${baseApiUrl}/${instCode}/mcPks?paging=false`;
    const result = await workerFetch(url, getToken());
    return (await result.json()) as McPackDb[];
}

async function syncMcPacksFromApi(instCode: string, updatedSince: Date): Promise<McPackDb[]> {
    const date = dateAsApiString(updatedSince);
    const url = `${baseApiUrl}/${instCode}/mcPks?updatedSince=${date}&paging=false`;
    const result = await workerFetch(url, getToken());
    return (await result.json()) as McPackDb[];
}
