import { loggerFactory } from '../../logger';
import { apiFetchJsonToArray } from '../../service/workerFetch';
import { orEmpty, toDateOrThrowError, toNumber } from '../stringUtils';
import { baseApiUrl } from '../syncSettings';
import { ToggleState } from '../toggleState';
import { dateAsApiString } from '../Utils/stringUtils';
import { getMockedMcPacksString } from './mcPacksMocked';

const _mock = new ToggleState(true);
export const mcPacksMock = _mock;

export interface McPackDb {
    id: number;
    commPkgNo: string;
    description: string;
    mcPkgNo: string;
    projectName: string;
    updatedAt: Date;
}

const log = loggerFactory.mcPacks('Api');

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
    const performanceLogger = log.performance();
    const items: McPackDb[] = _mock.isEnabled
        ? JSON.parse(getMockedMcPacksString(0))
        : await getAllMcPacksFromApi(instCode, abortSignal);
    performanceLogger.forceLogDelta(_mock.isEnabled ? 'Got mocked data' : ' Got api data');

    const results = items.map((item) => cleanupMcPack(item));
    performanceLogger.forceLogDelta('Cleanup mc Packs');
    return results;
}

export async function apiUpdatedMcPacks(
    instCode: string,
    fromDate: Date,
    abortSignal: AbortSignal
): Promise<McPackDb[]> {
    const items: McPackDb[] = _mock.isEnabled
        ? JSON.parse(getMockedMcPacksString(50000))
        : await getUpdatedMcPacksFromApi(instCode, fromDate, abortSignal);

    return items.map((item) => cleanupMcPack(item));
}

async function getAllMcPacksFromApi(instCode: string, abortSignal: AbortSignal): Promise<McPackDb[]> {
    const url = `${baseApiUrl}/${instCode}/mcPks?paging=false`;
    return await apiFetchJsonToArray<McPackDb>(url, abortSignal);
}

async function getUpdatedMcPacksFromApi(
    instCode: string,
    updatedSince: Date,
    abortSignal: AbortSignal
): Promise<McPackDb[]> {
    const date = dateAsApiString(updatedSince);
    const url = `${baseApiUrl}/${instCode}/mcPks?updatedSince=${date}&paging=false`;
    return await apiFetchJsonToArray<McPackDb>(url, abortSignal);
}
