import { loggerFactory } from '../../logger';
import { apiFetch } from '../../service/workerFetch';
import { ApiDataFetcher } from '../apiDataFetcher';
import { verifyCount } from '../dataVerification';
import { OfflineSystem } from '../offlineSystem';
import { orEmpty, toDateOrThrowError, toDateOrUndefined } from '../stringUtils';
import { getApiBaseUrl } from '../syncSettings';
import { dateAsApiString } from '../Utils/stringUtils';
import { getMockedWorkOrdersString } from './workOrdersMocked';

export const workOrdersApi = new ApiDataFetcher(cleanupWorkOrder);

export interface WorkOrderDb {
    workOrderId: string;
    orderTypeId: string;
    title: string;
    activeStatusIds: string[];
    basicStartDateTime?: Date;
    basicFinishDateTime?: Date;
    changedDateTime?: Date;
    createdDateTime: Date;
    functionalLocationId: string;
    phaseId: string;
    planningPlantId: string;
    tagId: string;
    workCenterId: string;
}

export interface WorkOrderDetails extends WorkOrderDb {
    equipmentId: string;
    longTextExists: string;
    longText?: string;
    maintenancePlanDate: Date;
    maintenancePlantId: string;
    maintenanceRecordId: string;
    personResponsible: string;
    personResponsibleId: string;
    plannerGroupId: string;
    tagPlantId: string;
}

const log = loggerFactory.workOrders('Api');
const workOrdersFetcher = new ApiDataFetcher(cleanupWorkOrder);

export const workOrderApi = {
    getAllOpen: getAllOpenWorkOrdersFromApi,
    getOpenAndClosed: getOpenAndClosedWorkOrdersApi,
    getOpenAndClosedWorkOrdersForTag: getOpenAndClosedWorkOrdersApi,
    state: workOrdersFetcher.state
};

function cleanupWorkOrder(workOrder: WorkOrderDb): WorkOrderDb {
    if (!workOrder.createdDateTime) log.warn('Undefined date', workOrder);
    return {
        workOrderId: orEmpty(workOrder.workOrderId),
        orderTypeId: orEmpty(workOrder.workOrderId),
        title: orEmpty(workOrder.title),
        activeStatusIds: workOrder.activeStatusIds ?? [],
        basicStartDateTime: toDateOrUndefined(workOrder.basicStartDateTime),
        basicFinishDateTime: toDateOrUndefined(workOrder.basicFinishDateTime),
        changedDateTime: toDateOrUndefined(workOrder.changedDateTime),
        createdDateTime: toDateOrThrowError(workOrder.createdDateTime),
        functionalLocationId: orEmpty(workOrder.functionalLocationId),
        phaseId: orEmpty(workOrder.phaseId),
        planningPlantId: orEmpty(workOrder.planningPlantId),
        tagId: orEmpty(workOrder.tagId),
        workCenterId: orEmpty(workOrder.workCenterId)
    };
}

const getMockedString = getMockedWorkOrdersString;

export async function getAllOpenWorkOrdersFromApi(instCode: string, abortSignal: AbortSignal): Promise<WorkOrderDb[]> {
    const url = `${getApiBaseUrl()}/${instCode}/work-orders/open?top=500000`;
    return workOrdersApi.fetchAll(url, () => getMockedString(50000), abortSignal);
}

export async function getOpenAndClosedWorkOrdersApi(
    instCode: string,
    fromDate: Date,
    abortSignal: AbortSignal
): Promise<WorkOrderDb[]> {
    const date = dateAsApiString(fromDate);
    const url = `${getApiBaseUrl()}/${instCode}/work-orders/open-and-closed?changedDateFrom=${date}&top=500000`;
    return workOrdersApi.fetchAll(url, () => getMockedWorkOrdersString(50000), abortSignal);
}

export async function getOpenAndClosedWorkOrdersForTagApi(
    instCode: string,
    tagNo: string,
    abortSignal: AbortSignal
): Promise<WorkOrderDb[]> {
    const url = `${getApiBaseUrl()}/${instCode}/tag/work-orders?tagNo=${encodeURIComponent(
        tagNo
    )}&top=500000&api-version=2.0`;
    return workOrdersApi.fetchAll(url, () => getMockedWorkOrdersString(50000), abortSignal);
}

async function apiEstimatedWorkOrderCount(instCode: string, abortSignal: AbortSignal): Promise<number> {
    const url = `${getApiBaseUrl()}/${instCode}/statistics/open-work-orders-estimated-count`;
    const response = await apiFetch(url, abortSignal);
    if (response.ok) return Number.parseInt(await response.text());
    return 0;
}

export async function verifyWorkOrderCount(
    instCode: string,
    workOrdersCount: number,
    abortSignal: AbortSignal
): Promise<boolean> {
    if (workOrdersApi.state.isMockEnabled) return true;
    return await verifyCount(
        workOrdersCount,
        () => apiEstimatedWorkOrderCount(instCode, abortSignal),
        OfflineSystem.WorkOrders
    );
}
