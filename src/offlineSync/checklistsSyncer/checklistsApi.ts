import { ApiDataFetcher } from '../apiDataFetcher';
import { queryParameters } from '../apiHelper';
import { orEmpty, toDateOrUndefined, toNumber } from '../stringUtils';
import { getApiBaseUrl } from '../syncSettings';
import { dateAsApiString, dateAsApiStringOrUndefined } from '../Utils/stringUtils';
import { getMockedChecklistsString } from './checklistsMocked';

// keep const log = loggerFactory.checklists('Api');
const checklistsApiFetcher = new ApiDataFetcher(cleanupChecklist);

export const checklistsApi = {
    allBy: apiAllChecklistsByCommPackNoStartsWith,
    updated: apiUpdatedChecklists,
    search: apiSearchChecklists,
    state: checklistsApiFetcher.state
};

export interface ChecklistDb {
    id: number;
    formType: string;
    formStatus: string;
    commPackNo: string;
    formResponsibleId: string;
    formUpdatedAt?: Date;
    formGroupDescription: string;
    tagNo: string;
    mcPackNo: string;
    formTypeDescription: string;
    url: string;
    tagDescription: string;
    tagRegisterId: string;
    tagProjectName: string;
    signedByFullName: string;
    signedByUserName: string;
    signedAt?: Date;
    verifiedByFullName: string;
    verifiedByUserName: string;
    verifiedAt?: Date;
    comment: string;
    attachmentCount: number;
}

function cleanupChecklist(checklist: ChecklistDb): ChecklistDb {
    return {
        id: toNumber(checklist.id),
        formType: orEmpty(checklist.formType),
        formStatus: orEmpty(checklist.formStatus),
        commPackNo: orEmpty(checklist.commPackNo),
        formResponsibleId: orEmpty(checklist.formResponsibleId),
        formUpdatedAt: toDateOrUndefined(checklist.formUpdatedAt),
        formGroupDescription: orEmpty(checklist.formGroupDescription),
        tagNo: orEmpty(checklist.tagNo),
        mcPackNo: orEmpty(checklist.mcPackNo),
        formTypeDescription: orEmpty(checklist.formTypeDescription),
        url: orEmpty(checklist.url),
        tagDescription: orEmpty(checklist.tagDescription),
        tagRegisterId: orEmpty(checklist.tagRegisterId),
        tagProjectName: orEmpty(checklist.tagProjectName),
        signedByFullName: orEmpty(checklist.signedByFullName),
        signedByUserName: orEmpty(checklist.signedByUserName),
        signedAt: toDateOrUndefined(checklist.signedAt),
        verifiedByFullName: orEmpty(checklist.verifiedByFullName),
        verifiedByUserName: orEmpty(checklist.verifiedByUserName),
        verifiedAt: toDateOrUndefined(checklist.verifiedAt),
        comment: orEmpty(checklist.comment),
        attachmentCount: toNumber(checklist.attachmentCount)
    };
}

async function apiAllChecklistsByCommPackNoStartsWith(
    instCode: string,
    commPackNoStartsWith: string,
    abortSignal?: AbortSignal
): Promise<ChecklistDb[]> {
    const url = `${getApiBaseUrl()}/${instCode}/checkLists?paging=false&commPkgNo=${commPackNoStartsWith}`;
    return checklistsApiFetcher.fetchAll(url, () => getMockedChecklistsString(1000), abortSignal);
}

async function apiUpdatedChecklists(
    instCode: string,
    fromDate: Date,
    abortSignal?: AbortSignal
): Promise<ChecklistDb[]> {
    const date = dateAsApiString(fromDate);
    const url = `${getApiBaseUrl()}/${instCode}/checkLists?updatedSince=${date}&paging=false`;
    return checklistsApiFetcher.fetchAll(url, () => getMockedChecklistsString(50000), abortSignal);
}

export interface ChecklistSearchFilter {
    tagNo?: string;
    commPackNo?: string;
    mcPackNo?: string;
    projectCode?: string;
}

async function apiSearchChecklists(
    instCode: string,
    filter: ChecklistSearchFilter,
    updatedSince?: Date,
    maxHits?: number,
    abortSignal?: AbortSignal
): Promise<ChecklistDb[]> {
    let url = `${getApiBaseUrl()}/${instCode}/checkLists`;
    url += queryParameters([
        { key: 'tagNo', value: filter.tagNo },
        { key: 'commPkgNo', value: filter.commPackNo },
        { key: 'mcPkgNo', value: filter.mcPackNo },
        { key: 'projectCode', value: filter.projectCode },
        { key: 'updatedSince', value: dateAsApiStringOrUndefined(updatedSince) },

        { key: 'itemsPerPage', value: maxHits },
        { key: 'paging', value: false }
    ]);

    return checklistsApiFetcher.fetchAll(url, () => getMockedChecklistsString(10), abortSignal);
}
