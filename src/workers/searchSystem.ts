import { ArgumentDateError, InternalSyncResult } from '../baseResult';
import { createSearchArraySuccessOrEmpty, searchErrorNotEnabled, SearchResults } from '../inMemory/searchResult';
import { isSyncEnabled, OfflineSystem } from '../offlineSync/syncSettings';

export class SearchSystem<T> {
    private _offlineSystemKey: OfflineSystem;
    private _initTask: Promise<void>;
    private _isOfflineSearchReady: () => boolean;
    private _offlineSearch: (searchText: string, maxHits: number) => Promise<T[]>;
    private _onlineSearch: (searchText: string, maxHits: number) => Promise<T[]>;
    private _fullSync: () => Promise<InternalSyncResult>;
    private _updateSync: (lastChangedDate: Date) => Promise<InternalSyncResult>;
    public get initTask(): Promise<void> {
        return this._initTask;
    }

    public get offlineSystemKey(): OfflineSystem {
        return this._offlineSystemKey;
    }

    constructor(
        offlineSystemKey: OfflineSystem,
        initTaskFunc: Promise<void>,
        isOfflineSearchReady: () => boolean,
        offlineSearch: (searchText: string, maxHits: number) => Promise<T[]>,
        onlineSearch: (searchText: string, maxHits: number) => Promise<T[]>,
        fullSync: () => Promise<InternalSyncResult>,
        updateSync: (lastChangedDate: Date) => Promise<InternalSyncResult>
    ) {
        this._offlineSystemKey = offlineSystemKey;
        this._initTask = initTaskFunc;
        this._isOfflineSearchReady = isOfflineSearchReady;
        this._offlineSearch = offlineSearch;
        this._onlineSearch = onlineSearch;
        this._fullSync = fullSync;
        this._updateSync = updateSync;
    }

    async search(searchText: string, maxHits: number): Promise<SearchResults<T>> {
        if (!isSyncEnabled(this._offlineSystemKey)) {
            return searchErrorNotEnabled<T>(this._offlineSystemKey);
        }
        await this._initTask;
        const data = this._isOfflineSearchReady()
            ? await this._offlineSearch(searchText, maxHits)
            : await this._onlineSearch(searchText, maxHits);
        return createSearchArraySuccessOrEmpty(data);
    }

    async runFullSync(): Promise<InternalSyncResult> {
        return await this._fullSync();
    }

    async runUpdateSync(lastChangedDate: Date): Promise<InternalSyncResult> {
        if (!lastChangedDate)
            throw new ArgumentDateError('lastChangedDate is undefined in update sync for ' + this.offlineSystemKey);
        return await this._updateSync(lastChangedDate);
    }
}
