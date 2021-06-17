import Dexie from 'dexie'; //If dexie compile error - remove this line and re-import it
import { logInfo, logVerbose } from '../logger';

export const baseApiUrl = 'https://dt-echopedia-api-dev.azurewebsites.net/';

/**
 * START Settings Repository
 * ideally this should be local storage
 */
class SettingsDexieDB extends Dexie {
    offlineStatus: Dexie.Table<OfflineSettingItem, OfflineSystem>;
    settings: Dexie.Table<string, string>;
    constructor() {
        super('offlineSettingsEchoDb');
        this.version(0.3).stores({
            offlineStatus: 'offlineSystemKey',
            settings: ''
        });

        this.offlineStatus = this.table('offlineStatus');
        this.settings = this.table('settings');
    }
}

let _settingsDexieDb: SettingsDexieDB | undefined = undefined;
let _instCode: string;

export function getInstCode(): string {
    if (!_instCode) {
        throw new Error('instCode is not defined');
    }
    return _instCode;
}

export async function saveInstCode(instCodeArg: string): Promise<void> {
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

    logVerbose(
        `[${offlineSettingItem.offlineSystemKey}] settings done saving. IsEnabled:`,
        offlineSettingItem.isEnable,
        offlineSettingItem.lastSyncedAtDate?.toISOString(),
        offlineSettingItem.newestItemDate?.toISOString()
    );
}

export async function loadOfflineSettings(): Promise<void> {
    const settings = await instance().offlineStatus.toArray();
    settings.forEach((setting) => {
        dictionary[setting.offlineSystemKey] = setting;
    });

    const instCodeArg = await instance().settings.get('instCode');
    _instCode = instCodeArg ?? '';
    logInfo('instCode loaded:', _instCode);

    AddMissingSettings();
}

/**
 * END Settings Repository
 */

const dictionary: Record<string, OfflineSettingItem> = {};

function AddMissingSettings() {
    for (const item in OfflineSystem) {
        const offlineSystemKey = item as OfflineSystem;
        const hasSetting = dictionary[offlineSystemKey];
        if (!hasSetting) {
            dictionary[offlineSystemKey] = CreateDefaultSettings(offlineSystemKey);
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
    throw new Error('settings not initialized - bug in code');
}

export function SaveSettings(settings: OfflineSettingItem): void {
    dictionary[settings.offlineSystemKey] = settings;
    fireAndForget(() => saveToRepository(settings));
}

function fireAndForget(asyncFunc: () => Promise<void>): void {
    asyncFunc();
}

export function CreateDefaultSettings(offlineSystemKey: OfflineSystem): OfflineSettingItem {
    const setting: OfflineSettingItem = {
        offlineSystemKey: offlineSystemKey,
        isEnable: offlineSystemKey === OfflineSystem.Tags || offlineSystemKey === OfflineSystem.Documents,
        newestItemDate: undefined,
        lastSyncedAtDate: undefined
    };
    return setting;
}

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
    WorkOrders = 'WorkOrders' //missing in SystemKey
}
