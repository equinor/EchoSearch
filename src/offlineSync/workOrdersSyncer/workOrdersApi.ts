import { loggerFactory } from '../../logger';
import { ApiDataFetcher } from '../apiDataFetcher';
import { toDateOrUndefined } from '../stringUtils';
import { getApiBaseUrl } from '../syncSettings';
import { getMockedWorkOrdersString } from './workOrdersMocked';

export const workOrdersApi = new ApiDataFetcher(cleanupWorkOrder);

export interface WorkOrderDb {
    activeStatusIds: string[];
    basicStartDateTime?: Date;
    basicFinishDateTime?: Date;
    changedDateTime: Date;
    createdDateTime: Date;
    functionalLocationId: string;
    orderTypeId: string;
    phaseId: string;
    planningPlantId: string;
    tagId: string;
    title: string;
    workCenterId: string;
    workOrderId: string;
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
    getOpenAndClosedWorkOrdersForTagNo: getOpenAndClosedWorkOrdersApi,
    getOpen: getOpenWorkOrdersFromApi,
    getWorkOrder: getWorkOrderApi,

    state: workOrdersFetcher.state
};

// does validations
function cleanupWorkOrder(workOrder: WorkOrderDb): WorkOrderDb {
    return {
        activeStatusIds: workOrder.activeStatusIds ?? [],
        basicStartDateTime: toDateOrUndefined(workOrder.basicStartDateTime),
        basicFinishDateTime: toDateOrUndefined(workOrder.basicFinishDateTime),
        changedDateTime: workOrder.changedDateTime,
        createdDateTime: workOrder.createdDateTime,
        functionalLocationId: workOrder.functionalLocationId,
        orderTypeId: workOrder.orderTypeId,
        phaseId: workOrder.phaseId,
        planningPlantId: workOrder.planningPlantId,
        tagId: workOrder.tagId,
        title: workOrder.title,
        workCenterId: workOrder.workCenterId,
        workOrderId: workOrder.workOrderId
    };
}

export async function getOpenAndClosedWorkOrdersApi(
    instCode: string,
    tagNo: string,
    abortSignal: AbortSignal
): Promise<WorkOrderDb[]> {
    const url = `${getApiBaseUrl}/${instCode}/tag/work-orders?tagNo=${encodeURIComponent(
        tagNo
    )}&top=500000&api-version=2.0`;
    return workOrdersApi.fetchAll(url, () => getMockedWorkOrdersString(50000), abortSignal);
}

export async function getOpenWorkOrdersFromApi(instCode: string, abortSignal: AbortSignal): Promise<WorkOrderDb[]> {
    const url = `${getApiBaseUrl}/${instCode}/work-orders/open?top=500000`;
    return workOrdersApi.fetchAll(url, () => getMockedWorkOrdersString(50000), abortSignal);
}

export async function getWorkOrderApi(workOrderId: string, abortSignal: AbortSignal): Promise<WorkOrderDetails> {
    const url = `${getApiBaseUrl}/work-orders/work-order-id?workOrderId=${encodeURIComponent(
        workOrderId
    )}&includeLongText=true`;

    return workOrdersFetcher.fetchSingle<WorkOrderDetails>(
        url,
        abortSignal,
        (item) => item,
        () => '' // mocked data
    );
}

// add data verification
// estimated work-order count
// verify work-order count
// add search/work-orders ?
