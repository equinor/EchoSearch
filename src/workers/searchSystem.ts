import { ArgumentDateError, InternalSyncResult } from '../baseResult';
import { searchResults, SearchResults } from '../inMemory/searchResult';
import { isSyncEnabled, OfflineSystem } from '../offlineSync/syncSettings';

export class SearchSystem<T> {
    private _offlineSystemKey: OfflineSystem;
    private _initTask: Promise<void>;
    private _isOfflineSearchReady: () => boolean;
    private _offlineSearch: (
        searchText: string,
        maxHits: number,
        offlinePredicate?: (arg: T) => boolean
    ) => Promise<T[]>;
    private _onlineSearch: (searchText: string, maxHits: number) => Promise<T[]>;
    private _fullSync: (abortSignal: AbortSignal) => Promise<InternalSyncResult>;
    private _updateSync: (lastChangedDate: Date, abortSignal: AbortSignal) => Promise<InternalSyncResult>;
    private _abortController: AbortController;
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
        offlineSearch: (searchText: string, maxHits: number, offlinePredicate?: (arg: T) => boolean) => Promise<T[]>,
        onlineSearch: (searchText: string, maxHits: number) => Promise<T[]>,
        fullSync: (abortSignal: AbortSignal) => Promise<InternalSyncResult>,
        updateSync: (lastChangedDate: Date, abortSignal: AbortSignal) => Promise<InternalSyncResult>
    ) {
        this._abortController = new AbortController();
        this._offlineSystemKey = offlineSystemKey;
        this._initTask = initTaskFunc;
        this._isOfflineSearchReady = isOfflineSearchReady;
        this._offlineSearch = offlineSearch;
        this._onlineSearch = onlineSearch;
        this._fullSync = fullSync;
        this._updateSync = updateSync;
    }

    async search(
        searchText: string,
        maxHits: number,
        offlinePredicate?: (arg: T) => boolean
    ): Promise<SearchResults<T>> {
        if (!isSyncEnabled(this._offlineSystemKey)) {
            return searchResults.syncNotEnabledError<T>(this._offlineSystemKey);
        }
        await this._initTask;
        const data = this._isOfflineSearchReady()
            ? await this._offlineSearch(searchText, maxHits, offlinePredicate)
            : await this._onlineSearch(searchText, maxHits);
        return searchResults.successOrEmpty(data);
    }

    cancelSync(): void {
        this._abortController.abort();
    }

    async runFullSync(): Promise<InternalSyncResult> {
        this._abortController.abort(); //in case we have an ongoing sync
        this._abortController = new AbortController();
        return await this._fullSync(this._abortController.signal);
    }

    async runUpdateSync(lastChangedDate: Date): Promise<InternalSyncResult> {
        if (!lastChangedDate)
            throw new ArgumentDateError('lastChangedDate is undefined in update sync for ' + this.offlineSystemKey);

        this._abortController.abort(); //in case we have an ongoing sync
        this._abortController = new AbortController();
        return await this._updateSync(lastChangedDate, this._abortController.signal);
    }
}
