import Dexie from 'dexie';
import { DatabaseAdministrator, OfflineDataDexieBase, Repository } from '../offlineDataDexieBase';
import { NotificationDb } from './notificationApi';

const databaseNamePreFix = 'notificationsVer';

class NotificationsDatabase extends OfflineDataDexieBase<NotificationDb> {
    NotificationsTable: Dexie.Table<NotificationDb, string>;

    constructor(version: number) {
        const tableNameCannotBeRenamed = 'Notifications';
        super(databaseNamePreFix + version, tableNameCannotBeRenamed);

        //Database versioning: https://dexie.org/docs/Tutorial/Design#database-versioning
        //=== Old Databases here - don't change this code, needed for migration ===

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

export function notificationsRepository(): Repository<NotificationDb> {
    return notificationsAdministrator().repository();
}
