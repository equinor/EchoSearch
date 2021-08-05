import Dexie, { IndexableTypeArrayReadonly } from 'dexie';
import { DbError, NotInitializedError, SyncCanceledError } from '../baseResult';
import { SearchResult, searchResult, SearchResults, searchResults } from '../inMemory/searchResult';
import { logger, LoggerFunctions } from '../logger';
import { getMaxNumberInCollectionOrOne } from './stringUtils';
import { OfflineSystem } from './syncSettings';
import { isNullOrEmpty } from './Utils/stringExtensions';
import { chunkArray } from './Utils/util';

export function getDatabaseName(offlineSystemKey: OfflineSystem): string {
    return `echoSearch${offlineSystemKey}Ver`;
}

const logging = logger('Db');

async function tryOrThrow<Tr>(runMainFunc: () => Promise<Tr>): Promise<Tr> {
    try {
        return await runMainFunc();
    } catch (exception) {
        throw new DbError((exception?.name + ' ' + exception?.message).trim(), exception);
    }
}

export class OfflineDataDexieBase<T> extends Dexie {
    databaseName: string;
    tableName: string;
    log: LoggerFunctions;

    constructor(databaseName: string, tableName: string) {
        super(databaseName);
        this.log = logging.create(tableName);
        this.databaseName = databaseName;
        this.tableName = tableName;
    }

    async tryToGet(key: string): Promise<T | undefined> {
        return await tryOrThrow(() => this.table(this.tableName).get(key));
    }
    async bulkGet(keys: string[]): Promise<T[]> {
        return await tryOrThrow(async () => {
            const items = keys.length > 0 ? await this.table(this.tableName).bulkGet(keys) : [];
            const result = items.filter((item) => item) as T[];
            return result ? result : [];
        });
    }

    async get(key: string): Promise<T | undefined> {
        if (isNullOrEmpty(key)) return undefined;
        return await this.table(this.tableName).get(key);
    }

    async addDataBulks(data: T[], abortSignal: AbortSignal): Promise<void> {
        const CHUNK_SIZE = 1250; //ChunkSize of 1250 or 5000: it takes the same amount of time to put data into indexDb. But with smaller chunk size, the read will be a lot faster, since indexDb prioritize read before chunk write.
        if (!data) data = [];

        const chunks = chunkArray(data, CHUNK_SIZE);
        const database = this.table(this.tableName);

        let index = 0;
        for await (const chunk of chunks) {
            if (abortSignal.aborted) {
                this.log.info('Sync canceled');
                throw new SyncCanceledError('Sync was canceled');
            }

            if (index % 20 === 0) this.log.info(`adding data.. ${index}/${chunks.length}`);
            index++;

            await database.bulkPut(chunk); //bulkAdd doesn't make any speed difference with 500k items with id as number.
            // if (currentIndex++ == 15) throw new Error('Testing failing dexie syncing');
        }
        if (abortSignal.aborted) {
            this.log.info('Sync canceled');
            throw new SyncCanceledError('Sync was canceled');
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

    async addDataBulks(data: T[], abortSignal: AbortSignal): Promise<void> {
        await this.database.addDataBulks(data, abortSignal);
    }

    async bulkDeleteData(keys: IndexableTypeArrayReadonly): Promise<void> {
        await this.database.bulkDeleteData(keys);
    }

    async bulkGet(keys: string[]): Promise<SearchResults<T>> {
        const results = await this.database.bulkGet(keys);
        return searchResults.successOrEmpty(results);
    }

    async get(key: string): Promise<SearchResult<T>> {
        const result = await this.database.get(key);
        return searchResult.successOrNotFound(result);
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
    log: LoggerFunctions;
    isInitDone: boolean;
    databaseNamePreFix: string;

    database: OfflineDataDexieBase<T> | null;
    databaseCreator: (version: number) => OfflineDataDexieBase<T>;
    constructor(databaseNamePreFix: string, databaseCreator: (version: number) => OfflineDataDexieBase<T>) {
        this.log = logging.create('Admin.' + databaseNamePreFix);
        this.databaseNamePreFix = databaseNamePreFix;
        this.isInitDone = false;
        this.database = null;
        this.databaseCreator = databaseCreator;
    }
    async init(): Promise<void> {
        if (this.isInitDone) {
            this.log.warn(this.databaseNamePreFix + ' has already been initialized');
            return;
        }
        const version = await getCurrentVersion(this.databaseNamePreFix);
        this.database = this.databaseCreator(version);
        this.isInitDone = true;
    }

    repositoryTransaction(): Repository<T> {
        if (this.database !== undefined) {
            return new Repository(this.database as OfflineDataDexieBase<T>);
        }
        throw new NotInitializedError('not initialized ' + this.databaseNamePreFix);
    }

    async deleteAndRecreate(): Promise<void> {
        const newVersionNumber = await deleteDataBaseAndReturnNewVersionNumber(this.databaseNamePreFix);
        this.openVersion(newVersionNumber);
    }

    private openVersion(currentVersion: number) {
        this.log.trace('opening database ' + this.databaseNamePreFix + currentVersion);
        this.database = this.databaseCreator(currentVersion);
    }
}

export async function getCurrentVersion(databaseNamePreFix: string): Promise<number> {
    const databaseNames = await getDatabaseNames(databaseNamePreFix);
    return getMaxNumberInCollectionOrOne(databaseNames);
}

export async function getDatabaseNames(databaseNamePreFix: string): Promise<string[]> {
    return (await Dexie.getDatabaseNames()).filter((item) => item.includes(databaseNamePreFix));
}
export async function deleteDataBaseAndReturnNewVersionNumber(databaseNamePreFix: string): Promise<number> {
    const p = logging.performance();
    const newVersion = 1 + getMaxNumberInCollectionOrOne(await getDatabaseNames(databaseNamePreFix));
    await DeleteOlDatabaseVersions(databaseNamePreFix, newVersion);
    p.forceLog('Deleted database ' + databaseNamePreFix);
    return newVersion;
}

async function DeleteOlDatabaseVersions(databaseNamePreFix: string, currentVersionToKeep: number) {
    const oldDatabaseNames = (await getDatabaseNames(databaseNamePreFix)).filter(
        (databaseName) => !databaseName.includes(currentVersionToKeep.toString())
    );

    oldDatabaseNames.forEach((oldDatabaseName) => {
        logging.trace('delete old database', oldDatabaseName);
        Dexie.delete(oldDatabaseName);
    });
}
