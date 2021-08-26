import { inMemoryWorkOrdersInstance } from '../../inMemory/inMemoryWorkOrders';
import { loggerFactory } from '../../logger';
import { InternalSyncResult } from '../../results/baseResult';
import { SyncSystem } from '../../workers/syncSystem';
import { OfflineSystem } from '../offlineSystem';
import { getInstCode, Settings } from '../syncSettings';
import { dateDifferenceInDays, getMaxDateFunc } from '../Utils/dateUtils';
import { getOpenWorkOrdersFromApi, WorkOrderDb } from './workOrdersApi';
import { workOrdersAdministrator, workOrdersRepositoryTransaction } from './workOrdersRepository';

const log = loggerFactory.workOrders('Syncer');

export const workOrdersSyncSystem = new SyncSystem(
    OfflineSystem.WorkOrders,
    inMemoryWorkOrdersInstance(),
    workOrdersAdministrator(),
    async (abortSignal) => syncOpenWorkOrders(abortSignal),
    async (lastChangedDate, abortSignal) => syncUpdateOpenWorkOrders(lastChangedDate, abortSignal)
);

async function syncOpenWorkOrders(abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const performanceLogger = log.performance();
    const data = await getOpenWorkOrdersFromApi(getInstCode(), abortSignal);
    performanceLogger.forceLogDelta(' Api ' + data.length);

    inMemoryWorkOrdersInstance().clearAndInit(data);
    performanceLogger.forceLogDelta('clear and init inMemoryData');

    await workOrdersAdministrator().deleteAndRecreate();
    performanceLogger.forceLogDelta('deleteAndRecreate');

    await workOrdersRepositoryTransaction().addDataBulks(data, abortSignal);
    performanceLogger.forceLogDelta('addDataBulks ' + data.length);
    const newestItemDate = getNewestItemDate(data);
    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

async function syncUpdateOpenWorkOrders(lastChangedDate: Date, abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const lastSyncedAtDate = Settings.get(OfflineSystem.WorkOrders).lastSyncedAtDate;
    const daysSinceLastUpdate = dateDifferenceInDays(new Date(), lastSyncedAtDate);
    const daysBackInTime = 30;
    const fullSyncNeeded = daysSinceLastUpdate > daysBackInTime;
    if (fullSyncNeeded) {
        log.debug(`Run full sync instead of update, days since last sync:`, daysSinceLastUpdate);
        return await syncOpenWorkOrders(abortSignal);
    } else {
        log.trace('daysSinceLastUpdate', daysSinceLastUpdate);
    }

    const performanceLogger = log.performance();
    // updated && closed work orders (status)

    // inMemoryWorkOrdersInstance().updateItems(data);
    // if (closedWorkOrderNos.length > 0) {
    //     log.debug('Delete closed inMemory workOrders', closedWorkOrderNos.length);
    //     inMemoryWorkOrdersInstance().removeItems(closedWorkOrderNos);
    // }
    // performanceLogger.forceLogDelta('Updated inMemory, total: ' + inMemoryWorkOrdersInstance().length());

    // const transaction = workOrdersRepositoryTransaction();
    // await transaction.addDataBulks(data, abortSignal);
    // if (closedWorkOrderNos.length > 0) {
    //     await transaction.bulkDeleteData(closedWorkOrderNos.map((item) => item.workOrderId));
    // }
    // performanceLogger.forceLogDelta('Add/Delete to Dexie');

    // const newestItemDate = getNewestItemDate(data);

    return { isSuccess: true, itemsSyncedCount: 2 };
}

function getNewestItemDate(data: WorkOrderDb[]) {
    return getMaxDateFunc(data, (workOrder) => [workOrder.changedDateTime]);
}
