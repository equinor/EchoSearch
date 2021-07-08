import Dexie from 'dexie'; //If dexie compile error - remove this line and re-import it
import { NotInitializedError } from '../baseResult';
import { logger } from '../logger';

const log = logger('SyncSettings');
export const baseApiUrl = 'https://dt-echopedia-api-dev.azurewebsites.net/';

/**
 * START Settings Repository
 * ideally this should be local storage
 */
class SettingsDexieDB extends Dexie {
    offlineStatus: Dexie.Table<OfflineSettingItem, OfflineSystem>;
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
    return await instance().settings.get('instCode');
}

async function saveInstCode(instCodeArg: string): Promise<void> {
    await instance()?.settings.put(instCodeArg, 'instCode');
    _instCode = instCodeArg;
}

function instance(): SettingsDexieDB {
    if (_settingsDexieDb !== undefined) {
        return _settingsDexieDb;
    }
    const db = new SettingsDexieDB();
    _settingsDexieDb = db;
    return db;
}

async function saveToRepository(offlineSettingItem: OfflineSettingItem): Promise<void> {
    await instance().offlineStatus.put(offlineSettingItem);

    log.create(offlineSettingItem.offlineSystemKey).trace(
        `settings done saving. IsEnabled:`,
        offlineSettingItem.isEnable,
        offlineSettingItem.lastSyncedAtDate?.toISOString(),
        offlineSettingItem.newestItemDate?.toISOString()
    );
}

async function loadOfflineSettings(): Promise<void> {
    const settings = await instance().offlineStatus.toArray();
    settings.forEach((setting) => {
        dictionary[setting.offlineSystemKey] = setting;
    });

    const instCodeArg = await getInstCodeOrUndefinedAsync();
    _instCode = instCodeArg ?? '';
    log.trace('instCode loaded:', _instCode);

    AddMissingSettings();
}

/**
 * END Settings Repository
 */

const dictionary: Record<string, OfflineSettingItem> = {};

function AddMissingSettings() {
    for (const item in OfflineSystem) {
        const hasSetting = dictionary[item];
        log.info(item, hasSetting);

        if (!hasSetting) {
            dictionary[item] = Settings.CreateDefaultSettings(item as OfflineSystem);
        }
    }
}

export function isSyncEnabled(offlineSystemKey: OfflineSystem): boolean {
    const settings = GetSetting(offlineSystemKey);
    return settings.isEnable;
}

export function setIsSyncEnabled(offlineSystemKey: OfflineSystem, isEnabled: boolean): void {
    const settings = GetSetting(offlineSystemKey);
    settings.isEnable = isEnabled;
    settings.lastSyncedAtDate = undefined;
    settings.newestItemDate = undefined;
    SaveSettings(settings);
}

export function isFullSyncDone(offlineSystemKey: OfflineSystem): boolean {
    const settings = GetSetting(offlineSystemKey);
    return settings.lastSyncedAtDate !== undefined;
}

export function GetSetting(offlineSystemKey: OfflineSystem): OfflineSettingItem {
    const result = dictionary[offlineSystemKey];
    if (result) {
        return { ...result };
    }
    throw new NotInitializedError('settings not initialized - bug in code');
}

export function SaveSettings(settings: OfflineSettingItem): void {
    dictionary[settings.offlineSystemKey] = settings;
    fireAndForget(() => saveToRepository(settings));
}

function fireAndForget(asyncFunc: () => Promise<void>): void {
    asyncFunc();
}

function CreateDefaultSettings(offlineSystemKey: OfflineSystem): OfflineSettingItem {
    return {
        offlineSystemKey: offlineSystemKey,
        isEnable: offlineSystemKey === OfflineSystem.Tags || offlineSystemKey === OfflineSystem.Documents,
        newestItemDate: undefined,
        lastSyncedAtDate: undefined
    };
}

export const Settings = {
    CreateDefaultSettings,
    loadOfflineSettings,
    saveInstCode,
    getInstCode,
    getInstCodeOrUndefinedAsync
};

export interface OfflineSettingItem {
    offlineSystemKey: OfflineSystem;
    isEnable: boolean;
    newestItemDate?: Date;
    lastSyncedAtDate?: Date;
}

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
