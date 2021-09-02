import { OfflineSystem } from '../offlineSync/offlineSystem';
import { ResultArray } from '../results/baseResult';
import { resultArray } from '../results/createResult';
import { WorkOrderDto } from '../workers/dataTypes';
import { InMemoryData } from './inMemoryData';
import { searchOrderedByBestMatch } from './inMemorySearch';
import { Filter } from './searchFilter';

//WorkOrders init
const inMemoryDbWorkOrders: InMemoryData<WorkOrderDto, string> = new InMemoryData<WorkOrderDto, string>(
    (item) => item.workOrderId
);

export function inMemoryWorkOrdersInstance(): InMemoryData<WorkOrderDto, string> {
    return inMemoryDbWorkOrders;
}

const all = () => inMemoryWorkOrdersInstance().all();

// fix this
export function searchInMemoryWorkOrdersWithText(
    searchText: string,
    maxHits: number,
    filter?: Filter<WorkOrderDto>,
    predicate?: (workOrder: WorkOrderDto) => boolean
): WorkOrderDto[] {
    return searchOrderedByBestMatch(
        all(),
        (item) => [
            item.workOrderId.toString(),
            item.functionalLocationId,
            item.title,
            item.tagId ?? '',
            item.workCenterId
        ],
        searchText,
        maxHits,
        OfflineSystem.WorkOrders,
        filter,
        predicate
    );
}

// check
export function searchInMemoryWorkOrdersByTagNos(tagNos: string[]): ResultArray<WorkOrderDto> {
    return resultArray.successOrEmpty(all().filter((n) => n.tagId && tagNos.indexOf(n.tagId) >= 0));
}
