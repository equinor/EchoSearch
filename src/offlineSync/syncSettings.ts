import Dexie from 'dexie'; //If dexie compile error - remove this line and re-import it
import { logger } from '../logger';
import { NotInitializedError } from '../results/errors';
import { OfflineSystem } from './offlineSystem';
import { ObservableState, ObservableStateReadonly } from './Utils/observableState';
import { dateAsApiString } from './Utils/stringUtils';

const log = logger('SyncSettings');
let _baseApiUrl: string | undefined = undefined;
export function getApiBaseUrl(): string {
    if (!_baseApiUrl)
        throw new NotInitializedError(
            'Echo Api base-url has not been set, did you forget to call setBaseApiUrl(baseUrl: string)?'
        );
    return _baseApiUrl;
}

function setApiBaseUrl(baseUrl: string): void {
    _baseApiUrl = baseUrl;
    if (_baseApiUrl.endsWith('/')) _baseApiUrl = _baseApiUrl.slice(0, -1);
}

/**
 * START Settings Repository
 * ideally this should be local storage
 */
class SettingsDexieDB extends Dexie {
    offlineStatus: Dexie.Table<OfflineSettingState, OfflineSystem>;
    settings: Dexie.Table<string, string>;
    constructor() {
        super('echoSearchSettings');
        this.version(0.3).stores({
            offlineStatus: 'offlineSystemKey',
            settings: ''
        });

        this.offlineStatus = this.table('offlineStatus');
        this.settings = this.table('settings');
    }
}

let _settingsDexieDb: SettingsDexieDB | undefined = undefined;
let _instCode: string | undefined;

/**
 * Returns the selected instCode, or throws exception NotInitializedError
 * @returns Returns the selected instCode, or throws exception NotInitializedError
 */
export function getInstCode(): string {
    if (!_instCode) {
        throw new NotInitializedError('instCode is not defined');
    }
    return _instCode;
}

async function getInstCodeOrUndefinedAsync(): Promise<string | undefined> {
    if (_instCode) {
        return _instCode;
    }
    _instCode = await dbInstance().settings.get('instCode');
    return _instCode;
}

async function saveInstCode(instCodeArg: string): Promise<void> {
    _instCode = instCodeArg;
    await dbInstance()?.settings.put(instCodeArg, 'instCode');
}

function dbInstance(): SettingsDexieDB {
    if (_settingsDexieDb !== undefined) {
        return _settingsDexieDb;
    }
    const db = new SettingsDexieDB();
    _settingsDexieDb = db;
    return db;
}

async function saveToRepository(offlineSettingItem: ObservableSetting): Promise<void> {
    const dbItemToSave = mapToState(offlineSettingItem);
    await dbInstance().offlineStatus.put(dbItemToSave);

    log.create(dbItemToSave.offlineSystemKey).debug(
        `settings done saving. IsEnabled:`,
        dbItemToSave.isEnabled,
        dbItemToSave.lastSyncedAtDate ? dateAsApiString(dbItemToSave.lastSyncedAtDate) : undefined,
        dbItemToSave.newestItemDate ? dateAsApiString(dbItemToSave.newestItemDate) : undefined
    );
}

async function loadOfflineSettings(): Promise<void> {
    if (_state) {
        log.warn('Settings has already been loaded, returning');
    }
    const settings = await dbInstance().offlineStatus.toArray();
    log.trace('Loaded offline settings from db, now saving to state', settings);
    _state = new SettingsState(settings);

    const instCodeArg = await getInstCodeOrUndefinedAsync();
    _instCode = instCodeArg ?? '';
    log.debug('instCode loaded:', _instCode);
}

function mapToState(from: ObservableSetting): OfflineSettingState {
    return {
        isEnabled: from.isEnabled.getValue(),
        offlineSystemKey: from.offlineSystemKey,
        lastSyncedAtDate: from.lastSyncedAtDate,
        newestItemDate: from.newestItemDate
    };
}

/**
 * END Settings Repository
 */

class SettingsState {
    private _stateDictionary: Record<string, ObservableSetting> = {};
    private _isInitializing: boolean;

    /**
     *
     */
    constructor(loadedState: OfflineSettingState[]) {
        this._isInitializing = true;
        for (const loaded of loadedState) {
            this.updateObservableSetting(loaded);
        }
        this._isInitializing = false;
    }

    private getObservableSetting(offlineSystemKey: OfflineSystem): ObservableSetting {
        const item = this._stateDictionary[offlineSystemKey];
        if (item) return item;

        if (!this._isInitializing) {
            log.create(offlineSystemKey).trace('Get - does not exist, creating default');
        }

        const defaultState = this.createDefaultState(offlineSystemKey);
        this._stateDictionary[offlineSystemKey] = {
            offlineSystemKey: offlineSystemKey,
            isEnabled: new ObservableState(defaultState.isEnabled),
            newestItemDate: defaultState.newestItemDate,
            lastSyncedAtDate: defaultState.lastSyncedAtDate
        };

        return this._stateDictionary[offlineSystemKey];
    }

    private updateObservableSetting(newSettings: OfflineSettingState) {
        const s = this.getObservableSetting(newSettings.offlineSystemKey);
        const hasEnabledChanged = !newSettings.isEnabled;
        s.isEnabled.setValue(newSettings.isEnabled);
        s.lastSyncedAtDate = hasEnabledChanged ? undefined : newSettings.lastSyncedAtDate;
        s.newestItemDate = hasEnabledChanged ? undefined : newSettings.newestItemDate;
        s.offlineSystemKey = newSettings.offlineSystemKey;
    }

    private createDefaultState(offlineSystemKey: OfflineSystem) {
        return {
            offlineSystemKey: offlineSystemKey,
            isEnabled: offlineSystemKey === OfflineSystem.Tags || offlineSystemKey === OfflineSystem.Documents,
            lastSyncedAtDate: undefined,
            newestItemDate: undefined
        };
    }

    get(offlineSystemKey: OfflineSystem): OfflineSettingState {
        return mapToState(this.getObservableSetting(offlineSystemKey));
    }

    all(): OfflineSettingState[] {
        return Object.values(this._stateDictionary).map((item) => mapToState(item));
    }

    save(settings: OfflineSettingState): void {
        this.updateObservableSetting(settings);
        this.fireAndForget(() => saveToRepository(this._stateDictionary[settings.offlineSystemKey]));
    }

    resetSetting(offlineSystemKey: OfflineSystem): void {
        const setting = this.createDefaultState(offlineSystemKey);
        this.save(setting);
    }

    setIsSyncEnabled(offlineSystemKey: OfflineSystem, isEnabled: boolean): void {
        const settings = this.get(offlineSystemKey);
        if (settings.isEnabled === isEnabled) return;
        log.create(offlineSystemKey).debug('IsEnabled: ', isEnabled);
        this.save({ ...this.createDefaultState(offlineSystemKey), isEnabled: isEnabled });
    }

    getObservable(offlineSystemKey: OfflineSystem): ObservableReadonlySetting {
        return { isEnabled: this.getObservableSetting(offlineSystemKey).isEnabled };
    }

    private fireAndForget(asyncFunc: () => Promise<void>): void {
        asyncFunc();
    }
}

let _state: SettingsState | undefined = undefined;
function stateInstance(): SettingsState {
    if (!_state) {
        log.error('Settings has not been loaded yet');
        throw new NotInitializedError('Settings has not been loaded yet');
    }
    return _state;
}

function isSyncEnabled(offlineSystemKey: OfflineSystem): boolean {
    return stateInstance().get(offlineSystemKey).isEnabled;
}

function isFullSyncDone(offlineSystemKey: OfflineSystem): boolean {
    const settings = stateInstance().get(offlineSystemKey);
    return settings.lastSyncedAtDate !== undefined;
}

export const Settings = {
    resetSetting: (offlineSystemKey: OfflineSystem): void => stateInstance().resetSetting(offlineSystemKey),
    loadOfflineSettings,

    save: (settings: OfflineSettingState): void => stateInstance().save(settings),
    get: (offlineSystemKey: OfflineSystem): OfflineSettingState => stateInstance().get(offlineSystemKey),
    getObservable: (offlineSystemKey: OfflineSystem): ObservableReadonlySetting =>
        stateInstance().getObservable(offlineSystemKey),
    all: (): OfflineSettingState[] => stateInstance().all(),

    saveInstCode,
    getInstCode,
    getInstCodeOrUndefinedAsync,

    isSyncEnabled,
    setIsSyncEnabled: (offlineSystemKey: OfflineSystem, isEnabled: boolean): void =>
        stateInstance().setIsSyncEnabled(offlineSystemKey, isEnabled),

    isFullSyncDone,

    setApiBaseUrl
};

interface ObservableReadonlySetting {
    isEnabled: ObservableStateReadonly<boolean>;
}

interface ObservableSetting {
    offlineSystemKey: OfflineSystem;
    isEnabled: ObservableState<boolean>;
    newestItemDate?: Date;
    lastSyncedAtDate?: Date;
}

interface OfflineSettingState {
    readonly offlineSystemKey: OfflineSystem;
    readonly isEnabled: boolean;
    readonly newestItemDate?: Date;
    readonly lastSyncedAtDate?: Date;
}
