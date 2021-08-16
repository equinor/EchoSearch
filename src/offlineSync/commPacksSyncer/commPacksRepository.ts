import Dexie from 'dexie';
import { DatabaseAdministrator, getDatabaseName, OfflineDataDexieBase, Repository } from '../offlineDataDexieBase';
import { OfflineSystem } from '../offlineSystem';
import { CommPackDb } from './commPacksApi';

const databaseNamePreFix = getDatabaseName(OfflineSystem.CommPack);

class CommPacksDatabase extends OfflineDataDexieBase<CommPackDb> {
    CommPacksTable: Dexie.Table<CommPackDb, string>;

    constructor(version: number) {
        const tableNameCannotBeRenamed = 'CommPacks';
        super(databaseNamePreFix + version, tableNameCannotBeRenamed);

        //Database versioning: https://dexie.org/docs/Tutorial/Design#database-versioning

        this.version(1.0) //It is preferred to increment the version by 0.1.
            .stores({
                CommPacks: 'id'
            });
        //.upgrade(() => {});
        this.CommPacksTable = this.table(tableNameCannotBeRenamed);
    }
}

const commPacksDatabaseAdministrator = new DatabaseAdministrator(
    databaseNamePreFix,
    (version) => new CommPacksDatabase(version)
);
export function commPacksAdministrator(): DatabaseAdministrator<CommPackDb> {
    return commPacksDatabaseAdministrator;
}

export function commPacksRepository(): Repository<CommPackDb> {
    return commPacksAdministrator().repositoryTransaction();
}
