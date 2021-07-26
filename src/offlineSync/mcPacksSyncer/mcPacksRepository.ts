import Dexie from 'dexie';
import { DatabaseAdministrator, getDatabaseName, OfflineDataDexieBase, Repository } from '../offlineDataDexieBase';
import { OfflineSystem } from '../syncSettings';
import { McPackDb } from './mcPacksApi';

const databaseNamePreFix = getDatabaseName(OfflineSystem.McPack);

class McPacksDatabase extends OfflineDataDexieBase<McPackDb> {
    McPacksTable: Dexie.Table<McPackDb, string>;

    constructor(version: number) {
        const tableNameCannotBeRenamed = 'McPacks';
        super(databaseNamePreFix + version, tableNameCannotBeRenamed);

        //Database versioning: https://dexie.org/docs/Tutorial/Design#database-versioning

        this.version(1.0) //It is preferred to increment the version by 0.1.
            .stores({
                McPacks: 'id'
            });
        //.upgrade(() => {});
        this.McPacksTable = this.table(tableNameCannotBeRenamed);
    }
}

const mcPacksDatabaseAdministrator = new DatabaseAdministrator(
    databaseNamePreFix,
    (version) => new McPacksDatabase(version)
);
export function mcPacksAdministrator(): DatabaseAdministrator<McPackDb> {
    return mcPacksDatabaseAdministrator;
}

export function mcPacksRepository(): Repository<McPackDb> {
    return mcPacksAdministrator().repositoryTransaction();
}
