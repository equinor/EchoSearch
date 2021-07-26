import { getDocumentKey } from '../offlineSync/documentsSyncer/documentDb';
import { OfflineSystem } from '../offlineSync/syncSettings';
import { DocumentSummaryDto } from '../workers/dataTypes';
import { InMemoryData } from './inMemoryData';
import { searchOrderedByBestMatch } from './inMemorySearch';
import { Filter } from './searchFilter';

const inMemoryDbDocuments: InMemoryData<DocumentSummaryDto, string> = new InMemoryData<DocumentSummaryDto, string>(
    (item) => getDocumentKey(item)
);

export function inMemoryDocumentsInstance(): InMemoryData<DocumentSummaryDto, string> {
    return inMemoryDbDocuments;
}

//TODO do we need to filter only on pdfs??
export function searchInMemoryDocumentsWithText(
    searchText: string,
    maxHits: number,
    filter?: Filter<DocumentSummaryDto>,
    predicate?: (mcPack: DocumentSummaryDto) => boolean
): DocumentSummaryDto[] {
    return searchOrderedByBestMatch(
        inMemoryDocumentsInstance().all(),
        (item) => [
            item.docNo,
            item.docTitle,
            item.projectCode,
            item.locationCode,
            item.system,
            item.docCategory,
            item.revStatus,
            item.revisionProject
        ],
        searchText,
        maxHits,
        OfflineSystem.Documents,
        filter,
        predicate
    );
}
