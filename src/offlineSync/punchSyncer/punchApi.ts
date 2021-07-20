import { apiFetch } from '../../service/workerFetch';
import { ApiDataFetcher } from '../apiDataFetcher';
import { verifyCount } from '../dataVerification';
import { orEmpty, toDateOrThrowError, toDateOrUndefined, toNumber } from '../stringUtils';
import { baseApiUrl, OfflineSystem } from '../syncSettings';
import { dateAsApiString } from '../Utils/stringUtils';
import { mockedOpenClosedRejectedAndRandomPunches, mockedOpenClosedRejectedPunches } from './punchesMocked';

//keep const log = loggerFactory.punches('Api');
export const punchesApi = new ApiDataFetcher(cleanupPunch);

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

export async function apiAllPunches(instCode: string, abortSignal: AbortSignal): Promise<PunchDb[]> {
    const url = `${baseApiUrl}/${instCode}/tag/punches?paging=false`;
    return punchesApi.fetchAll(url, abortSignal, () => mockedOpenClosedRejectedPunches());
}

export async function apiUpdatedPunches(
    instCode: string,
    fromDate: Date,
    abortSignal: AbortSignal
): Promise<PunchDb[]> {
    const date = dateAsApiString(fromDate);
    const url = `${baseApiUrl}/${instCode}/tag/punches?updatedSince=${date}&paging=false`;
    return punchesApi.fetchAll(url, abortSignal, () => mockedOpenClosedRejectedAndRandomPunches(50000));
}

async function apiEstimatedPunchCount(instCode: string, abortSignal: AbortSignal): Promise<number> {
    //Statistics/open-punches-estimated-count?instCode=JSV
    const url = `${baseApiUrl}/${instCode}/statistics/open-punches-estimated-count`;
    const response = await apiFetch(url, abortSignal);
    if (response.ok) return Number.parseInt(await response.text());
    return 0;
}

export async function verifyPunchCount(
    instCode: string,
    punchesCount: number,
    abortSignal: AbortSignal
): Promise<boolean> {
    if (punchesApi.isMockEnabled) return true;
    return await verifyCount(punchesCount, () => apiEstimatedPunchCount(instCode, abortSignal), OfflineSystem.Punches);
}
