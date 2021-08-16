import { ResultValue, ResultValues } from '..';
import { inMemoryDocumentsInstance } from '../inMemory/inMemoryDocuments';
import { inMemory } from '../inMemory/inMemoryExports';
import { Filter } from '../inMemory/searchFilter';
import { DocumentSummaryKey, getDocumentKey } from '../offlineSync/documentsSyncer/documentDb';
import { documentsSyncSystem } from '../offlineSync/documentsSyncer/documentsSyncer';
import { OfflineSystem } from '../offlineSync/offlineSystem';
import { DocumentSummaryDto } from './dataTypes';
import { SearchSystem } from './searchSystem';

let _documentsSearchSystem: SearchSystem<DocumentSummaryDto>;

async function initTask(): Promise<void> {
    const initCommTask = documentsSyncSystem.initTask();

    _documentsSearchSystem = new SearchSystem<DocumentSummaryDto>(OfflineSystem.Documents, initCommTask, () =>
        inMemory.Documents.isReady()
    );

    return await initCommTask;
}
async function search(
    searchText: string,
    maxHits: number,
    tryToApplyFilter?: Filter<DocumentSummaryDto>
): Promise<ResultValues<DocumentSummaryDto>> {
    return await _documentsSearchSystem.search(
        async () => inMemory.Documents.search(searchText, maxHits, tryToApplyFilter),
        async () => [] //documentsApi.search(searchText, maxHits, tryToApplyFilter?.projectName) //TODO
    );
}
async function lookup(id: DocumentSummaryKey): Promise<ResultValue<DocumentSummaryDto>> {
    return inMemoryDocumentsInstance().get(getDocumentKey(id)); //TODO get has the wrong type here, string, but it should be DocumentSummaryKey
}

async function lookupAll(ids: DocumentSummaryKey[]): Promise<ResultValues<DocumentSummaryDto>> {
    return inMemoryDocumentsInstance().getAll(ids.map((id) => getDocumentKey(id)));
}

export const externalDocuments = {
    initTask,
    search,
    lookup,
    lookupAll
};
