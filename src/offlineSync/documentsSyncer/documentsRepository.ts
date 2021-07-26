import Dexie from 'dexie';
import { DatabaseAdministrator, getDatabaseName, OfflineDataDexieBase, Repository } from '../offlineDataDexieBase';
import { OfflineSystem } from '../syncSettings';
import { DocumentSummaryDb } from './documentDb';

const databaseNamePreFix = getDatabaseName(OfflineSystem.Documents);

class DocumentsDatabase extends OfflineDataDexieBase<DocumentSummaryDb> {
    DocumentsTable: Dexie.Table<DocumentSummaryDb, string>;

    constructor(version: number) {
        const tableNameCannotBeRenamed = 'Documents';
        super(databaseNamePreFix + version, tableNameCannotBeRenamed);

        //Database versioning: https://dexie.org/docs/Tutorial/Design#database-versioning

        this.version(1.0) //It is preferred to increment the version by 0.1.
            .stores({
                Documents: '[docNo+revNo], docNo'
            });
        //.upgrade(() => {});
        this.DocumentsTable = this.table(tableNameCannotBeRenamed);
    }
}

const documentsDatabaseAdministrator = new DatabaseAdministrator(
    databaseNamePreFix,
    (version) => new DocumentsDatabase(version)
);
export function documentsAdministrator(): DatabaseAdministrator<DocumentSummaryDb> {
    return documentsDatabaseAdministrator;
}

export function documentsRepository(): Repository<DocumentSummaryDb> {
    return documentsAdministrator().repositoryTransaction();
}
