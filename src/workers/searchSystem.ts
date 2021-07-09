//import { ArgumentDateError, InternalSyncResult } from '../baseResult';
import { searchResults, SearchResults } from '../inMemory/searchResult';
import { OfflineSystem, Settings } from '../offlineSync/syncSettings';

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
        onlineSearch: (searchText: string, maxHits: number) => Promise<T[]>
    ) {
        this._offlineSystemKey = offlineSystemKey;
        this._initTask = initTaskFunc;
        this._isOfflineSearchReady = isOfflineSearchReady;
        this._offlineSearch = offlineSearch;
        this._onlineSearch = onlineSearch;
    }

    async search(
        searchText: string,
        maxHits: number,
        offlinePredicate?: (arg: T) => boolean
    ): Promise<SearchResults<T>> {
        if (!Settings.isSyncEnabled(this._offlineSystemKey)) {
            return searchResults.syncNotEnabledError<T>(this._offlineSystemKey);
        }
        await this._initTask;
        console.log(this._offlineSystemKey, 'is offline search ready:', this._isOfflineSearchReady());
        const data = this._isOfflineSearchReady()
            ? await this._offlineSearch(searchText, maxHits, offlinePredicate)
            : await this._onlineSearch(searchText, maxHits);
        return searchResults.successOrEmpty(data);
    }
}
