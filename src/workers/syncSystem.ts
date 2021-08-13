import { InMemoryInterface } from '../inMemory/inMemoryData';
import { logger, LoggerFunctions } from '../logger';
import { DatabaseAdministrator } from '../offlineSync/offlineDataDexieBase';
import { OfflineSystem, Settings } from '../offlineSync/syncSettings';
import { ArgumentDateError, InternalSyncResult } from '../results/baseResult';

export class SyncSystem<T> {
    private log: LoggerFunctions;

    private _initTask: Promise<void> | undefined;
    private _abortController: AbortController;
    private _inMemoryData?: InMemoryInterface<T>;
    private _databaseAdministrator: DatabaseAdministrator<T>;
    private _offlineSystemKey: OfflineSystem;
    private _fullSync: (abortSignal: AbortSignal) => Promise<InternalSyncResult>;
    private _updateSync: (lastChangedDate: Date, abortSignal: AbortSignal) => Promise<InternalSyncResult>;
    constructor(
        _offlineSystemKey: OfflineSystem,
        inMemoryData: InMemoryInterface<T> | undefined,
        databaseAdministrator: DatabaseAdministrator<T>,
        fullSync: (abortSignal: AbortSignal) => Promise<InternalSyncResult>,
        updateSync: (lastChangedDate: Date, abortSignal: AbortSignal) => Promise<InternalSyncResult>
    ) {
        this.log = logger('SyncSystem.' + _offlineSystemKey);
        this._abortController = new AbortController();
        this._inMemoryData = inMemoryData;
        this._databaseAdministrator = databaseAdministrator;
        this._offlineSystemKey = _offlineSystemKey;
        this._fullSync = fullSync;
        this._updateSync = updateSync;
    }

    public get offlineSystemKey(): OfflineSystem {
        return this._offlineSystemKey;
    }

    async setIsEnabled(isEnabled: boolean): Promise<void> {
        Settings.setIsSyncEnabled(this._offlineSystemKey, isEnabled);
        if (!isEnabled) {
            await this._databaseAdministrator.deleteAndRecreate();
            this._inMemoryData?.clearData();
        }
    }

    async runFullSync(): Promise<InternalSyncResult> {
        this._abortController.abort(); //in case we have an ongoing sync //TODO maybe we shouldn't abort, but wait for this one to finish?
        this._abortController = new AbortController();
        return await this._fullSync(this._abortController.signal);
    }

    async runUpdateSync(lastChangedDate: Date): Promise<InternalSyncResult> {
        if (!lastChangedDate)
            throw new ArgumentDateError('lastChangedDate is undefined in update sync for ' + this._offlineSystemKey);

        this._abortController.abort(); //in case we have an ongoing sync
        this._abortController = new AbortController();
        return await this._updateSync(lastChangedDate, this._abortController.signal);
    }

    private async internalInitTask(): Promise<void> {
        const performanceLogger = this.log.performance('Init');
        await this._databaseAdministrator.init();

        if (!this._inMemoryData) {
            return;
        }

        if (Settings.isSyncEnabled(this._offlineSystemKey) && !Settings.isFullSyncDone(this._offlineSystemKey)) {
            const logMessage = `Full ${this._offlineSystemKey} sync is not done, cannot init in memory`;
            Settings.isSyncEnabled(this._offlineSystemKey) ? this.log.warn(logMessage) : this.log.debug(logMessage);
            return;
        }

        const repository = this._databaseAdministrator.repositoryTransaction();
        const data = await repository.slowlyGetAllData();
        if (data.length > 0) this._inMemoryData.clearAndInit(data);

        performanceLogger.forceLogDelta('done ' + data.length);
    }

    /**
     * Init task instance, which will run only once.
     * @returns the init task instance.
     */
    async initTask(): Promise<void> {
        if (!this._initTask) this._initTask = this.internalInitTask();
        return this._initTask;
    }

    async clearAllData(): Promise<void> {
        this.cancelSync();
        await this._databaseAdministrator.deleteAndRecreate();
        this.clearSettings(this._offlineSystemKey);
        this._inMemoryData?.clearData();
        this.log.trace('Finished clearing data');
    }

    private clearSettings(offlineSystemKey: OfflineSystem): void {
        Settings.resetSetting(offlineSystemKey);
    }

    cancelSync(): void {
        this._abortController.abort();
    }
}
