import { inMemory } from '../inMemory/inMemoryExports';
import { inMemoryWorkOrdersInstance, searchInMemoryWorkOrdersByTagNos } from '../inMemory/inMemoryWorkOrders';
import { Filter } from '../inMemory/searchFilter';
import { OfflineSystem } from '../offlineSync/offlineSystem';
import { workOrdersSyncSystem } from '../offlineSync/workOrdersSyncer/workOrdersSyncer';
import { ResultArray, ResultValue } from '../results/baseResult';
import { WorkOrderDto } from './dataTypes';
import { SearchSystem } from './searchSystem';

let _workOrdersSearchSystem: SearchSystem<WorkOrderDto>;

async function initTask(): Promise<void> {
    const initWorkOrderTask = workOrdersSyncSystem.initTask();

    _workOrdersSearchSystem = new SearchSystem<WorkOrderDto>(OfflineSystem.WorkOrders, initWorkOrderTask, () =>
        inMemory.WorkOrders.isReady()
    );
    await initWorkOrderTask;
}

async function search(
    searchText: string,
    maxHits: number,
    tryToApplyFilter?: Filter<WorkOrderDto>
): Promise<ResultArray<WorkOrderDto>> {
    return await _workOrdersSearchSystem.search(
        async () => inMemory.WorkOrders.search(searchText, maxHits, tryToApplyFilter),
        async () => []
    );
}

async function lookup(id: string): Promise<ResultValue<WorkOrderDto>> {
    return inMemoryWorkOrdersInstance().get(id);
}

async function lookupAll(ids: string[]): Promise<ResultArray<WorkOrderDto>> {
    return inMemoryWorkOrdersInstance().getAll(ids);
}

async function searchByTagNos(tagNos: string[]): Promise<ResultArray<WorkOrderDto>> {
    return searchInMemoryWorkOrdersByTagNos(tagNos);
}

export const externalWorkOrders = {
    initTask,
    search,
    searchByTagNos,
    lookup,
    lookupAll
};
