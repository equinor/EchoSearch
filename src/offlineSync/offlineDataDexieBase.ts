import Dexie, { IndexableTypeArrayReadonly } from 'dexie';
import { logPerformance, logVerbose, logWarn } from '../logger';
import { BaseError } from './baseError';
import { getMaxNumberInCollectionOrOne } from './stringUtils';
import { chunkArray } from './Utils/util';

class SyncCanceledError extends BaseError {
    constructor(message: string) {
        super(message);
        this.hasBeenLogged = true; //expected - should not be logged
    }
}

export class OfflineDataDexieBase<T> extends Dexie {
    databaseName: string;
    tableName: string;
    cancelSyncFlag: boolean;
    constructor(databaseName: string, tableName: string) {
        super(databaseName);
        this.databaseName = databaseName;
        this.tableName = tableName;
        this.cancelSyncFlag = false;
    }

    async tryToGet(key: string): Promise<T | undefined> {
        return await this.table(this.tableName).get(key);
    }

    async bulkGet(keys: string[]): Promise<T[]> {
        const tagResults = keys.length > 0 ? await this.table(this.tableName).bulkGet(keys) : [];
        return tagResults.filter((item) => item !== undefined) as T[];
    }

    cancelSync(): void {
        this.cancelSyncFlag = true;
    }

    async addDataBulks(data: T[]): Promise<void> {
        this.cancelSyncFlag = false;
        const CHUNK_SIZE = 1250; //ChunkSize of 1250 or 5000: it takes the same amount of time to put data into indexDb. But with smaller chunk size, the read will be a lot faster, since indexDb prioritize read before chunk write.
        if (!data) data = [];

        const chunks = chunkArray(data, CHUNK_SIZE);
        const database = this.table(this.tableName);

        console.log('now trying put instead of add');
        for await (const chunk of chunks) {
            if (this.cancelSyncFlag) {
                throw new SyncCanceledError('Sync was canceled');
            }
            await database.bulkPut(chunk); //bulkAdd doesn't make any speed difference with 500k items with id as number.
            //TODO Ove - do we need retry?
            // currentIndex++;
            // if (currentIndex == 15) throw new Error('Testing failing dexie syncing');
        }
    }

    async bulkDeleteData(keys: IndexableTypeArrayReadonly): Promise<void> {
        await this.table(this.tableName).bulkDelete(keys);
    }

    /**
     * Returns all the data in indexDb database.
     * Be aware that this is a slow and blocking operation, and should generally be avoided.
     * @returns All the data.
     */
    async slowlyGetAllData(): Promise<T[]> {
        return await this.table(this.tableName).toArray();
    }
}

/**
 * Wraps the functionality from Dexie that we want to expose.
 */
export class Repository<T> {
    database: OfflineDataDexieBase<T>;
    constructor(database: OfflineDataDexieBase<T>) {
        this.database = database;
    }

    async addDataBulks(data: T[]): Promise<void> {
        await this.database.addDataBulks(data);
    }

    async bulkDeleteData(keys: IndexableTypeArrayReadonly): Promise<void> {
        await this.database.bulkDeleteData(keys);
    }

    async bulkGet(keys: string[]): Promise<T[]> {
        return await this.database.bulkGet(keys);
    }

    cancelSync(): void {
        this.database.cancelSync();
    }

    /**
     * Returns all the data in indexDb database.
     * Be aware that this is a slow and blocking operation, and should generally be avoided.
     * @returns All the data.
     */
    async slowlyGetAllData(): Promise<T[]> {
        return await this.database.slowlyGetAllData();
    }
}

export class DatabaseAdministrator<T> {
    //repository: Repository<T>
    isInitDone: boolean;
    databaseNamePreFix: string;

    database: OfflineDataDexieBase<T> | null;
    databaseCreator: (version: number) => OfflineDataDexieBase<T>;
    constructor(databaseNamePreFix: string, databaseCreator: (version: number) => OfflineDataDexieBase<T>) {
        this.databaseNamePreFix = databaseNamePreFix;
        this.isInitDone = false;
        this.database = null;
        this.databaseCreator = databaseCreator;
    }
    async init(): Promise<void> {
        if (this.isInitDone) {
            logWarn(this.databaseNamePreFix + ' has already been initialized');
            return;
        }
        const version = await getCurrentVersion(this.databaseNamePreFix);
        this.database = this.databaseCreator(version);
        this.isInitDone = true;
    }

    repository(): Repository<T> {
        if (this.database !== undefined) {
            return new Repository(this.database as OfflineDataDexieBase<T>);
        }
        throw new Error('not initialized ' + this.databaseNamePreFix);
    }

    async deleteAndRecreate(): Promise<void> {
        const newVersionNumber = await deleteDataBaseAndReturnNewVersionNumber(this.databaseNamePreFix);
        this.openVersion(newVersionNumber);
    }

    private openVersion(currentVersion: number) {
        logVerbose('opening database v' + this.databaseNamePreFix + currentVersion);
        this.database = this.databaseCreator(currentVersion);
    }
}

export async function getCurrentVersion(databaseNamePreFix: string): Promise<number> {
    const databaseNames = await getDatabaseNames(databaseNamePreFix);
    const currentVersion = getMaxNumberInCollectionOrOne(databaseNames);
    return currentVersion;
}

export async function getDatabaseNames(databaseNamePreFix: string): Promise<string[]> {
    return (await Dexie.getDatabaseNames()).filter((item) => item.includes(databaseNamePreFix));
}
export async function deleteDataBaseAndReturnNewVersionNumber(databaseNamePreFix: string): Promise<number> {
    const p = logPerformance();
    const newVersion = 1 + getMaxNumberInCollectionOrOne(await getDatabaseNames(databaseNamePreFix));
    await DeleteOlDatabaseVersions(databaseNamePreFix, newVersion);
    p.forceLog('Deleted  database ' + databaseNamePreFix);
    return newVersion;
}

async function DeleteOlDatabaseVersions(databaseNamePreFix: string, currentVersionToKeep: number) {
    const oldDatabaseNames = (await getDatabaseNames(databaseNamePreFix)).filter(
        (databaseName) => !databaseName.includes(currentVersionToKeep.toString())
    );

    oldDatabaseNames.forEach((oldDatabaseName) => {
        logVerbose('delete old database', oldDatabaseName);
        Dexie.delete(oldDatabaseName);
    });
}
