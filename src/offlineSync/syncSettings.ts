import Dexie from 'dexie'; //If dexie compile error - remove this line and re-import it
import { NotInitializedError } from '../baseResult';
import { logger } from '../logger';

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

async function saveToRepository(offlineSettingItem: OfflineSettingItem): Promise<void> {
    await dbInstance().offlineStatus.put(offlineSettingItem);

    log.create(offlineSettingItem.offlineSystemKey).debug(
        `settings done saving. IsEnabled:`,
        offlineSettingItem.isEnabled,
        offlineSettingItem.lastSyncedAtDate?.toISOString(),
        offlineSettingItem.newestItemDate?.toISOString()
    );
}

async function loadOfflineSettings(): Promise<void> {
    const settings = await dbInstance().offlineStatus.toArray();
    settings.forEach((setting) => {
        _dictionary[setting.offlineSystemKey] = setting;
    });

    const instCodeArg = await getInstCodeOrUndefinedAsync();
    _instCode = instCodeArg ?? '';
    log.debug('instCode loaded:', _instCode);

    AddMissingSettings();
}

/**
 * END Settings Repository
 */

const _dictionary: Record<string, OfflineSettingItem> = {};

function AddMissingSettings() {
    for (const item in OfflineSystem) {
        const hasSetting = _dictionary[item];
        if (!hasSetting) {
            _dictionary[item] = Settings.createDefaultSettings(item as OfflineSystem);
        }
    }
}

function isSyncEnabled(offlineSystemKey: OfflineSystem): boolean {
    const result = _dictionary[offlineSystemKey];
    return result?.isEnabled === true;
}

function setIsSyncEnabled(offlineSystemKey: OfflineSystem, isEnabled: boolean): void {
    const settings = getSettingsOrThrow(offlineSystemKey);
    if (isEnabled && settings.isEnabled === isEnabled) return;

    const newSettings: OfflineSettingItemDb = { ...settings };
    newSettings.isEnabled = isEnabled;
    newSettings.lastSyncedAtDate = undefined;
    newSettings.newestItemDate = undefined;

    log.create(offlineSystemKey).debug('IsEnabled: ', isEnabled);
    saveSettings(newSettings);
}

function isFullSyncDone(offlineSystemKey: OfflineSystem): boolean {
    const settings = getSettingsOrThrow(offlineSystemKey);
    return settings.lastSyncedAtDate !== undefined;
}

function getSettingsOrThrow(offlineSystemKey: OfflineSystem): OfflineSettingItem {
    const result = _dictionary[offlineSystemKey];
    if (result) {
        return result;
    }
    throw new NotInitializedError('settings not initialized - bug in code');
}

function saveSettings(settings: OfflineSettingItem): void {
    _dictionary[settings.offlineSystemKey] = settings;
    fireAndForget(() => saveToRepository(settings));
}

function fireAndForget(asyncFunc: () => Promise<void>): void {
    asyncFunc();
}

function createDefaultSettings(offlineSystemKey: OfflineSystem): OfflineSettingItem {
    return {
        offlineSystemKey: offlineSystemKey,
        isEnabled: offlineSystemKey === OfflineSystem.Tags || offlineSystemKey === OfflineSystem.Documents,
        newestItemDate: undefined,
        lastSyncedAtDate: undefined
    };
}

function allSettings(): OfflineSettingItem[] {
    return Object.values(_dictionary);
}

export const Settings = {
    createDefaultSettings,
    loadOfflineSettings,

    save: saveSettings,
    get: getSettingsOrThrow,
    all: allSettings,

    saveInstCode,
    getInstCode,

    getInstCodeOrUndefinedAsync,

    isSyncEnabled,
    setIsSyncEnabled,

    isFullSyncDone,

    setApiBaseUrl
};

interface OfflineSettingItemDb {
    offlineSystemKey: OfflineSystem;
    isEnabled: boolean;
    newestItemDate?: Date;
    lastSyncedAtDate?: Date;
}

export type OfflineSettingItem = Readonly<OfflineSettingItemDb>;

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
