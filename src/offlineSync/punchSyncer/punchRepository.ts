import Dexie from 'dexie';
import { DatabaseAdministrator, OfflineDataDexieBase, Repository } from '../offlineDataDexieBase';
import { PunchDb } from './punchApi';

const databaseNamePreFix = 'punchesVer';

class PunchesDatabase extends OfflineDataDexieBase<PunchDb> {
    PunchesTable: Dexie.Table<PunchDb, string>;

    constructor(version: number) {
        const tableNameCannotBeRenamed = 'Punches';
        super(databaseNamePreFix + version, tableNameCannotBeRenamed);

        //Database versioning: https://dexie.org/docs/Tutorial/Design#database-versioning
        //=== Old Databases here - don't change this code, needed for migration ===

        this.version(1.0) //It is preferred to increment the version by 0.1.
            .stores({
                Punches: 'id'
            });
        //.upgrade(() => {});
        this.PunchesTable = this.table(tableNameCannotBeRenamed);
    }
}

const punchesDatabaseAdministrator = new DatabaseAdministrator(
    databaseNamePreFix,
    (version) => new PunchesDatabase(version)
);
export function punchesAdministrator(): DatabaseAdministrator<PunchDb> {
    return punchesDatabaseAdministrator;
}

export function punchesRepository(): Repository<PunchDb> {
    return punchesAdministrator().repository();
}
