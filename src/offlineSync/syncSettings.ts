import Dexie from 'dexie'; //If dexie compile error - remove this line and re-import it
import { NotInitializedError } from '../baseResult';
import { logger } from '../logger';
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
    offlineStatus: Dexie.Table<OfflineSettingItemDb, OfflineSystem>;
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

async function saveToRepository(offlineSettingItem: readOnlyOfflineSettingItem): Promise<void> {
    const dbItemToSave = mapToDb(offlineSettingItem);
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
    _state = new SettingsState(settings.map((item) => mapToState(item)));

    const instCodeArg = await getInstCodeOrUndefinedAsync();
    _instCode = instCodeArg ?? '';
    log.debug('instCode loaded:', _instCode);
}

function mapToState(from: OfflineSettingItemDb): readOnlyOfflineSettingItem {
    return {
        isEnabled: from.isEnabled,
        offlineSystemKey: from.offlineSystemKey,
        lastSyncedAtDate: from.lastSyncedAtDate,
        newestItemDate: from.newestItemDate
    };
}

function mapToDb(from: readOnlyOfflineSettingItem): OfflineSettingItemDb {
    return {
        isEnabled: from.isEnabled,
        offlineSystemKey: from.offlineSystemKey,
        lastSyncedAtDate: from.lastSyncedAtDate,
        newestItemDate: from.newestItemDate,
        dummy: false
    };
}

/**
 * END Settings Repository
 */

class SettingsState {
    private _stateDictionary: Record<string, OfflineSettingItem> = {};
    private _isInitializing: boolean;

    /**
     *
     */
    constructor(loadedState: readOnlyOfflineSettingItem[]) {
        this._isInitializing = true;
        for (const loaded of loadedState) {
            this.internalSetState(loaded);
        }
        this._isInitializing = false;
    }

    private getInstance(offlineSystemKey: OfflineSystem): OfflineSettingItem {
        const item = this._stateDictionary[offlineSystemKey];
        if (!item) {
            if (!this._isInitializing) {
                log.create(offlineSystemKey).trace('Get - does not exist, creating default');
            }
            this._stateDictionary[offlineSystemKey] = createDefaultSettings(item as OfflineSystem);
        }

        return this._stateDictionary[offlineSystemKey];
    }

    get(offlineSystemKey: OfflineSystem): readOnlyOfflineSettingItem {
        return { ...this.getInstance(offlineSystemKey) };
    }

    all(): readOnlyOfflineSettingItem[] {
        return Object.values(this._stateDictionary).map((item) => {
            return { ...item };
        });
    }

    save(settings: readOnlyOfflineSettingItem): void {
        this.internalSetState(settings);
        this.fireAndForget(() => saveToRepository(this._stateDictionary[settings.offlineSystemKey]));
    }

    private internalSetState(newSettings: readOnlyOfflineSettingItem) {
        const s = this.getInstance(newSettings.offlineSystemKey);
        const hasEnabledChanged = !newSettings.isEnabled;
        s.isEnabled = newSettings.isEnabled;
        s.lastSyncedAtDate = hasEnabledChanged ? undefined : newSettings.lastSyncedAtDate;
        s.newestItemDate = hasEnabledChanged ? undefined : newSettings.newestItemDate;
        s.offlineSystemKey = newSettings.offlineSystemKey;
    }

    setIsSyncEnabled(offlineSystemKey: OfflineSystem, isEnabled: boolean): void {
        const settings = this.getInstance(offlineSystemKey);
        if (settings.isEnabled === isEnabled) return;
        settings.isEnabled = isEnabled;
        settings.lastSyncedAtDate = undefined;
        settings.newestItemDate = undefined;
        log.create(offlineSystemKey).debug('IsEnabled: ', isEnabled);
        this.fireAndForget(() => saveToRepository(settings));
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

function createDefaultSettings(offlineSystemKey: OfflineSystem): OfflineSettingItem {
    return {
        offlineSystemKey: offlineSystemKey,
        isEnabled: offlineSystemKey === OfflineSystem.Tags || offlineSystemKey === OfflineSystem.Documents,
        newestItemDate: undefined,
        lastSyncedAtDate: undefined
    };
}

function resetSetting(offlineSystemKey: OfflineSystem): void {
    const settings = createDefaultSettings(offlineSystemKey);
    Settings.save(settings);
}

export const Settings = {
    resetSetting,
    loadOfflineSettings,

    save: (settings: readOnlyOfflineSettingItem): void => stateInstance().save(settings),
    get: (offlineSystemKey: OfflineSystem): readOnlyOfflineSettingItem => stateInstance().get(offlineSystemKey),
    all: (): readOnlyOfflineSettingItem[] => stateInstance().all(),

    saveInstCode,
    getInstCode,

    getInstCodeOrUndefinedAsync,

    isSyncEnabled,
    setIsSyncEnabled: (offlineSystemKey: OfflineSystem, isEnabled: boolean): void =>
        stateInstance().setIsSyncEnabled(offlineSystemKey, isEnabled),

    isFullSyncDone,

    setApiBaseUrl
};

interface OfflineSettingItemDb {
    offlineSystemKey: OfflineSystem;
    isEnabled: boolean;
    newestItemDate?: Date;
    lastSyncedAtDate?: Date;
    dummy: boolean;
}

interface OfflineSettingItem {
    offlineSystemKey: OfflineSystem;
    isEnabled: boolean;
    newestItemDate?: Date;
    lastSyncedAtDate?: Date;
}

export type readOnlyOfflineSettingItem = Readonly<OfflineSettingItem>;

//TODO move to file
export enum OfflineSystem {
    Tags = 'Tags',
    Documents = 'Documents',
    Punches = 'Punches',
    Checklist = 'Checklist',
    CommPack = 'CommPack',
    McPack = 'McPack',
    Notifications = 'Notifications',
    WorkOrders = 'WorkOrders'
}
