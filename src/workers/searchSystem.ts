import { searchResults, SearchResults } from '../inMemory/searchResult';
import { OfflineSystem, Settings } from '../offlineSync/syncSettings';

export class SearchSystem<T> {
    private _offlineSystemKey: OfflineSystem;
    private _initTask: Promise<void>;
    private _isOfflineSearchReady: () => boolean;
    public get initTask(): Promise<void> {
        return this._initTask;
    }

    public get offlineSystemKey(): OfflineSystem {
        return this._offlineSystemKey;
    }

    constructor(offlineSystemKey: OfflineSystem, initTaskFunc: Promise<void>, isOfflineSearchReady: () => boolean) {
        this._offlineSystemKey = offlineSystemKey;
        this._initTask = initTaskFunc;
        this._isOfflineSearchReady = isOfflineSearchReady;
    }

    async search(offlineSearch: () => Promise<T[]>, onlineSearch: () => Promise<T[]>): Promise<SearchResults<T>> {
        if (!Settings.isSyncEnabled(this._offlineSystemKey)) {
            return searchResults.syncNotEnabledError<T>(this._offlineSystemKey);
        }

        await this._initTask;

        const data = this._isOfflineSearchReady() ? await offlineSearch() : await onlineSearch();
        return searchResults.successOrEmpty(data);
    }
}
