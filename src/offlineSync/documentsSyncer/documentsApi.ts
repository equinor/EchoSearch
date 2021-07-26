import { SyncError } from '../../baseResult';
import { loggerFactory } from '../../logger';
import { ApiDataFetcher } from '../apiDataFetcher';
import { extractDateFromHeader } from '../apiHelper';
import { orEmpty, toDateOrThrowError } from '../stringUtils';
import { baseApiUrl } from '../syncSettings';
import { dateAsApiString } from '../Utils/stringUtils';
import { DocumentSummaryDb, FileDb } from './documentDb';
import { getMockedDocumentString } from './documentsMocked';

const log = loggerFactory.documents('Api');

const documentsApiFetcher = new ApiDataFetcher(cleanupDocument);

export const documentsApi = {
    all: getAllDocumentsFromApi,
    updated: getUpdatedDocumentsFromApi,

    state: documentsApiFetcher.state
};

export interface DocumentsData {
    documents: DocumentSummaryDb[];
    dataSyncedAt: Date;
}

function cleanupDocument(document: DocumentSummaryDb): DocumentSummaryDb {
    return {
        instCode: orEmpty(document.instCode),
        docNo: orEmpty(document.docNo),
        docTitle: orEmpty(document.docTitle),
        projectCode: document.projectCode,
        //poNo: orEmpty(document.poNo),
        system: orEmpty(document.system),
        locationCode: orEmpty(document.locationCode),

        docCategory: orEmpty(document.docCategory),
        docType: orEmpty(document.docType),
        //contrCode: string;
        revNo: orEmpty(document.revNo),
        revDate: document.revDate,
        revStatus: orEmpty(document.revStatus),
        revisionProject: orEmpty(document.revisionProject),
        //keep reasonForIssue: string;
        //keep remark: string;
        tagNoMedia: orEmpty(document.tagNoMedia),
        insertedDate: toDateOrThrowError(document.insertedDate),
        updatedDate: document.updatedDate,
        files: document.files ? document.files.map((file) => cleanupFile(file)) : []
    };
}

function cleanupFile(file: FileDb): FileDb {
    return {
        description: orEmpty(file.description),
        fileName: orEmpty(file.fileName),
        fileOrder: file.fileOrder,
        fileSize: file.fileSize,
        id: file.id,
        insertedDate: toDateOrThrowError(file.insertedDate),
        instCode: orEmpty(file.instCode),
        prodViewCode: orEmpty(file.prodViewCode)
    };
}

async function getAllDocumentsFromApi(instCode: string, abortSignal: AbortSignal): Promise<DocumentsData> {
    const url = `${baseApiUrl}/${instCode}/archived-docs-file`;
    let dateSyncedAt: Date | undefined = undefined;
    const documents = await documentsApiFetcher.fetchAll(
        url,
        () => getMockedDocumentString(0),
        abortSignal,
        (response) => (dateSyncedAt = extractDateFromHeader(response, 'content-disposition'))
    );

    if (documentsApiFetcher.state.isMockEnabled) dateSyncedAt = new Date();

    if (!dateSyncedAt) throw new SyncError(`header content-disposition doesn't exist`); //Expected from api, something is wrong with api response

    log.trace(
        'All Documents:',
        documents.length,
        dateSyncedAt,
        documentsApiFetcher.state.isMockEnabled ? 'Using mock data' : ''
    );
    return { documents, dataSyncedAt: dateSyncedAt };
}

async function getUpdatedDocumentsFromApi(
    instCode: string,
    fromDate: Date,
    abortSignal: AbortSignal
): Promise<DocumentSummaryDb[]> {
    const date = dateAsApiString(fromDate);
    const url = `${baseApiUrl}/${instCode}/documents/diagrams?updatedSince=${date}&take=99000000`;

    const documents = await documentsApiFetcher.fetchAll(url, () => getMockedDocumentString(50000), abortSignal);
    return documents;
}
