import { InternalSyncResult } from '../../baseResult';
import { inMemoryDocumentsInstance } from '../../inMemory/inMemoryDocuments';
import { loggerFactory } from '../../logger';
import { SyncSystem } from '../../workers/syncSystem';
import { getInstCode, OfflineSystem, Settings } from '../syncSettings';
import { getMaxDateFunc } from '../Utils/dateUtils';
import { DocumentSummaryDb } from './documentDb';
import { documentsApi } from './documentsApi';
import { documentsAdministrator, documentsRepository } from './documentsRepository';

const log = loggerFactory.documents('Syncer');

export const documentsSyncSystem = new SyncSystem(
    OfflineSystem.Documents,
    inMemoryDocumentsInstance(),
    documentsAdministrator(),
    async (abortSignal) => syncFullDocuments(abortSignal),
    async (lastChangedDate, abortSignal) => syncUpdateDocuments(lastChangedDate, abortSignal)
);
export async function setDocumentsIsEnabled(isEnabled: boolean): Promise<void> {
    Settings.setIsSyncEnabled(OfflineSystem.Documents, isEnabled);

    if (!isEnabled) {
        documentsAdministrator().deleteAndRecreate(); //TODO part of searchSystem?
        inMemoryDocumentsInstance().clearData();
    }
}

async function syncFullDocuments(abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const performanceLogger = log.performance();
    const data = await documentsApi.all(getInstCode(), abortSignal);
    performanceLogger.forceLogDelta('Api ' + data.documents.length);

    inMemoryDocumentsInstance().clearAndInit(data.documents);
    performanceLogger.forceLogDelta('clear and init inMemoryData');

    await documentsAdministrator().deleteAndRecreate();
    performanceLogger.forceLogDelta('deleteAndRecreate');

    await documentsRepository().addDataBulks(data.documents, abortSignal);
    performanceLogger.forceLogDelta('addDataBulks ' + data.documents.length);

    return { isSuccess: true, itemsSyncedCount: data.documents.length, newestItemDate: data.dataSyncedAt };
}

async function syncUpdateDocuments(lastChangedDate: Date, abortSignal: AbortSignal): Promise<InternalSyncResult> {
    const performanceLogger = log.performance();
    const data = await documentsApi.updated(getInstCode(), lastChangedDate, abortSignal);
    performanceLogger.forceLogDelta('Api ' + data.length);

    inMemoryDocumentsInstance().updateItems(data);
    performanceLogger.forceLogDelta('Add to inMemory, total: ' + inMemoryDocumentsInstance().length());

    await documentsRepository().addDataBulks(data, abortSignal);
    performanceLogger.forceLogDelta('Add to Dexie');

    const newestItemDate = getNewestItemDate(data);

    return { isSuccess: true, itemsSyncedCount: data.length, newestItemDate };
}

function getNewestItemDate(data: DocumentSummaryDb[]) {
    return getMaxDateFunc(data, (document) => [document.updatedDate, document.insertedDate]);
}
