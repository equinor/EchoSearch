import { loggerFactory } from '../../logger';
import { apiFetch, apiFetchJsonToArray } from '../../service/workerFetch';
import { verifyCount } from '../dataVerification';
import { orEmpty, toDateOrThrowError, toDateOrUndefined, toNumber } from '../stringUtils';
import { baseApiUrl, OfflineSystem } from '../syncSettings';
import { ToggleState } from '../toggleState';
import { dateAsApiString } from '../Utils/stringUtils';
import { urlOrFakeError } from '../Utils/urlOrFakeError';
import { mockedOpenClosedRejectedPunches, randomMockedPunchesArrayString } from './punchesMocked';

const log = loggerFactory.punches('Api');
const _mock = new ToggleState(true);
export const punchesMock = _mock;

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
    const performanceLogger = log.performance();
    const items: PunchDb[] = _mock.isEnabled
        ? JSON.parse(mockedOpenClosedRejectedPunches())
        : await getAllPunchesFromApi(instCode, abortSignal);
    performanceLogger.forceLogDelta(_mock.isEnabled ? 'Got mocked data' : ' Got api data');

    const results = items.map((item) => cleanupPunch(item));
    performanceLogger.forceLogDelta('Cleanup mc Packs');
    return results;
}

export async function apiUpdatedPunches(
    instCode: string,
    fromDate: Date,
    abortSignal: AbortSignal
): Promise<PunchDb[]> {
    const items: PunchDb[] = _mock.isEnabled
        ? mockedUpdatedPunches()
        : await getUpdatedPunchesFromApi(instCode, fromDate, abortSignal);

    return items.map((item) => cleanupPunch(item));
}

export async function apiEstimatedPunchCount(instCode: string, abortSignal: AbortSignal): Promise<number> {
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
    if (_mock.isEnabled) return true;
    return await verifyCount(punchesCount, () => apiEstimatedPunchCount(instCode, abortSignal), OfflineSystem.Punches);
}

function mockedUpdatedPunches(): PunchDb[] {
    const punches: PunchDb[] = JSON.parse(mockedOpenClosedRejectedPunches());
    const randomPunches: PunchDb[] = JSON.parse(randomMockedPunchesArrayString(1));
    return punches.concat(randomPunches);
}

async function getAllPunchesFromApi(instCode: string, abortSignal: AbortSignal): Promise<PunchDb[]> {
    const url = `${baseApiUrl}/${instCode}/tag/punches?paging=false`;
    return await apiFetchJsonToArray<PunchDb>(url, abortSignal);
}

async function getUpdatedPunchesFromApi(
    instCode: string,
    updatedSince: Date,
    abortSignal: AbortSignal
): Promise<PunchDb[]> {
    const date = dateAsApiString(updatedSince);
    const url = `${baseApiUrl}/${instCode}/tag/punches?updatedSince=${date}&paging=false`;
    return await apiFetchJsonToArray<PunchDb>(urlOrFakeError(url), abortSignal);
}
