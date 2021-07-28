import Dexie from 'dexie';
import { DatabaseAdministrator, getDatabaseName, OfflineDataDexieBase, Repository } from '../offlineDataDexieBase';
import { OfflineSystem } from '../syncSettings';
import { ChecklistDb } from './checklistsApi';

const databaseNamePreFix = getDatabaseName(OfflineSystem.Checklist);

class ChecklistsDatabase extends OfflineDataDexieBase<ChecklistDb> {
    ChecklistsTable: Dexie.Table<ChecklistDb, string>;

    constructor(version: number) {
        const tableNameCannotBeRenamed = 'Checklists';
        super(databaseNamePreFix + version, tableNameCannotBeRenamed);

        //Database versioning: https://dexie.org/docs/Tutorial/Design#database-versioning

        this.version(1.0) //It is preferred to increment the version by 0.1.
            .stores({
                Checklists: 'id'
            });
        //.upgrade(() => {});
        this.ChecklistsTable = this.table(tableNameCannotBeRenamed);
    }
}

const checklistsDatabaseAdministrator = new DatabaseAdministrator(
    databaseNamePreFix,
    (version) => new ChecklistsDatabase(version)
);
export function checklistsAdministrator(): DatabaseAdministrator<ChecklistDb> {
    return checklistsDatabaseAdministrator;
}

export function checklistsRepository(): Repository<ChecklistDb> {
    return checklistsAdministrator().repositoryTransaction();
}
