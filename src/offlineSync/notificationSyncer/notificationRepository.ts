import Dexie from 'dexie';
import { DatabaseAdministrator, getDatabaseName, OfflineDataDexieBase, Repository } from '../offlineDataDexieBase';
import { OfflineSystem } from '../offlineSystem';
import { NotificationDb } from './notificationApi';

const databaseNamePreFix = getDatabaseName(OfflineSystem.Notifications);

class NotificationsDatabase extends OfflineDataDexieBase<NotificationDb> {
    NotificationsTable: Dexie.Table<NotificationDb, string>;

    constructor(version: number) {
        const tableNameCannotBeRenamed = 'Notifications';
        super(databaseNamePreFix + version, tableNameCannotBeRenamed);

        //Database versioning: https://dexie.org/docs/Tutorial/Design#database-versioning

        this.version(1.0) //It is preferred to increment the version by 0.1.
            .stores({
                Notifications: 'maintenanceRecordId'
            });
        //.upgrade(() => {});
        this.NotificationsTable = this.table(tableNameCannotBeRenamed);
    }
}

const notificationsDatabaseAdministrator = new DatabaseAdministrator(
    databaseNamePreFix,
    (version) => new NotificationsDatabase(version)
);
export function notificationsAdministrator(): DatabaseAdministrator<NotificationDb> {
    return notificationsDatabaseAdministrator;
}

export function notificationsRepositoryTransaction(): Repository<NotificationDb> {
    return notificationsAdministrator().repositoryTransaction();
}
