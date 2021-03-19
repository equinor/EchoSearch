import Dexie from 'dexie'; //If dexie compile error - remove this line and re-import it
import { logVerbose } from '../logger';

/**
 * START Settings Repository
 * ideally this should be local storage
 */
class SettingsDexieDB extends Dexie {
    offlineStatus: Dexie.Table<OfflineSettingItem, OfflineSystem>;
    constructor() {
        super('offlineSettingsEchoDb');
        this.version(0.2).stores({
            offlineStatus: 'offlineSystemKey'
        });

        this.offlineStatus = this.table('offlineStatus');
    }
}

let settingsDexieDb: SettingsDexieDB | undefined = undefined;

function instance(): SettingsDexieDB {
    if (settingsDexieDb !== undefined) {
        return settingsDexieDb;
    }
    let db = new SettingsDexieDB();
    settingsDexieDb = db;
    return db;
}

async function saveToRepository(offlineSettingItem: OfflineSettingItem): Promise<void> {
    await instance()
        .offlineStatus.put(offlineSettingItem)
        .then((_) => logVerbose(offlineSettingItem.offlineSystemKey, 'settings done saving'));
}

export async function loadOfflineSettings(): Promise<void> {
    const settings = await instance().offlineStatus.toArray();
    settings.forEach((setting) => {
        dictionary[setting.offlineSystemKey] = setting;
    });

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
    settings.syncDataDate = undefined;
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

export function SaveSettings(settings: OfflineSettingItem) {
    dictionary[settings.offlineSystemKey] = settings;
    saveToRepository(settings); //TODO - Fire and Forget method
}

export function CreateDefaultSettings(offlineSystemKey: OfflineSystem): OfflineSettingItem {
    const setting: OfflineSettingItem = {
        offlineSystemKey: offlineSystemKey,
        isEnable: offlineSystemKey === OfflineSystem.Tags || offlineSystemKey === OfflineSystem.Documents,
        syncDataDate: undefined,
        lastSyncedAtDate: undefined
    };
    return setting;
}

export interface OfflineSettingItem {
    offlineSystemKey: OfflineSystem;
    isEnable: boolean;
    syncDataDate?: Date;
    lastSyncedAtDate?: Date;
}

export enum OfflineSystem {
    Tags = 'Tags',
    Documents = 'Documents',
    Punches = 'Punches',
    Checklist = 'Checklist',
    CommPk = 'CommPk',
    McPk = 'McPk',
    Notifications = 'Notifications',
    WorkOrders = 'WorkOrders' //missing in SystemKey
}
