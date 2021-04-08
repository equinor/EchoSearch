import { logPerformance } from '../../logger';
import { apiFetch } from '../../service/workerFetch';
import { orEmpty, toDateOrThrowError, toDateOrUndefined, toNumber } from '../stringUtils';
import { baseApiUrl } from '../syncSettings';
import { dateAsApiString } from '../Utils/stringUtils';
import { openClosedRejectedPunches, randomMockedPunchesArrayString } from './punchesMocked';

const useMockData = true;

export interface PunchDb {
    id: number;
    //punchListItemNo: number; //not needed, same as id
    createdAt: Date;
    updatedAt: Date;
    clearedAt?: Date;
    rejectedAt?: Date;

    tagNo: string;
    tagDescription: string;
    tagArea: string;
    description: string;
    statusId: string;
    mcPkgNo: string;
    commPkgNo: string;
    areaId: string;
    url: string;
    systemId: string;
    clearedByOrg: string;
    raisedByOrg: string;
    typeDescription: string;
    priorityId: string;
    plantIdentificator: string;
}

function cleanupPunch(punch: PunchDb): PunchDb {
    return {
        id: toNumber(punch.id),
        tagNo: punch.tagNo,
        createdAt: toDateOrThrowError(punch.createdAt),
        updatedAt: toDateOrThrowError(punch.updatedAt),
        clearedAt: toDateOrUndefined(punch.clearedAt),
        rejectedAt: toDateOrUndefined(punch.rejectedAt),
        tagDescription: orEmpty(punch.tagDescription),
        description: orEmpty(punch.description),
        statusId: orEmpty(punch.statusId),
        mcPkgNo: orEmpty(punch.mcPkgNo),
        commPkgNo: orEmpty(punch.commPkgNo),
        areaId: orEmpty(punch.areaId),
        url: orEmpty(punch.url),
        tagArea: orEmpty(punch.tagArea),
        systemId: orEmpty(punch.systemId),
        clearedByOrg: orEmpty(punch.clearedByOrg),
        raisedByOrg: orEmpty(punch.raisedByOrg),
        typeDescription: orEmpty(punch.typeDescription),
        priorityId: orEmpty(punch.priorityId),
        plantIdentificator: orEmpty(punch.plantIdentificator)
    };
}

export async function apiAllPunches(instCode: string): Promise<PunchDb[]> {
    const performanceLogger = logPerformance();
    const items: PunchDb[] = useMockData
        ? JSON.parse(openClosedRejectedPunches())
        : await getAllPunchesFromApi(instCode);
    performanceLogger.forceLogDelta(useMockData ? 'Got mocked data' : ' Got api data');

    const results = items.map((item) => cleanupPunch(item));
    performanceLogger.forceLogDelta('Cleanup mc Packs');
    return results;
}

export async function apiUpdatedPunches(instCode: string, fromDate: Date): Promise<PunchDb[]> {
    const items: PunchDb[] = useMockData
        ? JSON.parse(randomMockedPunchesArrayString(2))
        : await getUpdatedPunchesFromApi(instCode, fromDate);

    return items.map((item) => cleanupPunch(item));
}

async function getAllPunchesFromApi(instCode: string): Promise<PunchDb[]> {
    const url = `${baseApiUrl}/${instCode}/tag/punches?paging=false`;
    const result = await apiFetch(url);
    return (await result.json()) as PunchDb[];
}

async function getUpdatedPunchesFromApi(instCode: string, updatedSince: Date): Promise<PunchDb[]> {
    const date = dateAsApiString(updatedSince);
    const url = `${baseApiUrl}/${instCode}/tag/punches?updatedSince=${date}&paging=false`;
    const result = await apiFetch(url);
    return (await result.json()) as PunchDb[];
}
