import Dexie from 'dexie';
import { DatabaseAdministrator, getDatabaseName, OfflineDataDexieBase, Repository } from '../offlineDataDexieBase';
import { OfflineSystem } from '../offlineSystem';
import { WorkOrderDb } from './workOrdersApi';

const databaseNamePreFix = getDatabaseName(OfflineSystem.WorkOrders);

class WorkOrdersDatabase extends OfflineDataDexieBase<WorkOrderDb> {
    WorkOrdersTable: Dexie.Table<WorkOrderDb, string>;

    constructor(version: number) {
        const tableNameCannotBeRenamed = 'WorkOrders';
        super(databaseNamePreFix + version, tableNameCannotBeRenamed);

        //Database versioning: https://dexie.org/docs/Tutorial/Design#database-versioning

        this.version(1.0) //It is preferred to increment the version by 0.1.
            .stores({
                WorkOrders: 'workOrderId'
            });
        //.upgrade(() => {});
        this.WorkOrdersTable = this.table(tableNameCannotBeRenamed);
    }
}

const workOrdersDatabaseAdministrator = new DatabaseAdministrator(
    databaseNamePreFix,
    (version) => new WorkOrdersDatabase(version)
);
export function workOrdersAdministrator(): DatabaseAdministrator<WorkOrderDb> {
    return workOrdersDatabaseAdministrator;
}

export function workOrdersRepositoryTransaction(): Repository<WorkOrderDb> {
    return workOrdersAdministrator().repositoryTransaction();
}
