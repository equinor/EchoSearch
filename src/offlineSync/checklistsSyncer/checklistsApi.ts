import { ApiDataFetcher } from '../apiDataFetcher';
import { orEmpty, toDateOrThrowError, toDateOrUndefined, toNumber } from '../stringUtils';
import { baseApiUrl } from '../syncSettings';
import { dateAsApiString } from '../Utils/stringUtils';
import { getMockedChecklistsString } from './checklistsMocked';

// keep const log = loggerFactory.checklists('Api');
const checklistsApiFetcher = new ApiDataFetcher(cleanupChecklist);

export const checklistsApi = {
    all: apiAllChecklistsByCommPackNoStartsWith,
    updated: apiUpdatedChecklists,
    //search: apiSearchChecklists,
    state: checklistsApiFetcher.state
};

export interface ChecklistDb {
    id: number;
    formType: string;
    formStatus: string;
    commPackNo: string;
    formResponsibleId: string;
    formUpdatedAt: Date;
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
        formUpdatedAt: toDateOrThrowError(checklist.formUpdatedAt),
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
    const url = `${baseApiUrl}/${instCode}/checkLists?paging=false&commPkgNo=${commPackNoStartsWith}`;
    return checklistsApiFetcher.fetchAll(url, () => getMockedChecklistsString(0), abortSignal);
}

async function apiUpdatedChecklists(
    instCode: string,
    fromDate: Date,
    abortSignal?: AbortSignal
): Promise<ChecklistDb[]> {
    const date = dateAsApiString(fromDate);
    const url = `${baseApiUrl}/${instCode}/checkLists?updatedSince=${date}&paging=false`;
    return checklistsApiFetcher.fetchAll(url, () => getMockedChecklistsString(50000), abortSignal);
}

// async function apiSearchChecklists(
//     searchText: string,
//     maxHits: number,
//     instCode?: string,
//     projectCode?: string,
//     abortSignal?: AbortSignal
// ): Promise<ChecklistDb[]> {
//     instCode = instCode ?? Settings.getInstCode();
//     let url = `${baseApiUrl}/${instCode}/commPks`;
//     url += queryParameter('containsText', searchText, '?');
//     url += queryParameter('projectCodeContains', projectCode);
//     url += queryParameter('itemsPerPage', maxHits);
//     return checklistsApiFetcher.fetchAll(url, () => getMockedChecklistsString(100), abortSignal);
// }
