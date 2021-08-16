import { loggerFactory } from '../logger';
import { OfflineSystem } from '../offlineSync/offlineSystem';
import { Settings } from '../offlineSync/syncSettings';
import { ResultArray } from '../results/baseResult';
import { resultArray } from '../results/createResult';

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

    async search(offlineSearch: () => Promise<T[]>, onlineSearch: () => Promise<T[]>): Promise<ResultArray<T>> {
        if (!Settings.isSyncEnabled(this._offlineSystemKey)) {
            return resultArray.syncNotEnabledError<T>(this._offlineSystemKey);
        }

        await this._initTask;

        const isOfflineSearch = this._isOfflineSearchReady();
        loggerFactory.default(this._offlineSystemKey + '.SearchSystem').debug(isOfflineSearch ? 'Offline' : 'Online');

        const data = isOfflineSearch ? await offlineSearch() : await onlineSearch();
        return resultArray.successOrEmpty(data);
    }
}
