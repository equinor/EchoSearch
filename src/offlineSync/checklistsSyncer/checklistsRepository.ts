import Dexie from 'dexie';
import { DatabaseAdministrator, getDatabaseName, OfflineDataDexieBase, Repository } from '../offlineDataDexieBase';
import { OfflineSystem } from '../syncSettings';
import { ChecklistDb } from './checklistsApi';

const databaseNamePreFix = getDatabaseName(OfflineSystem.Checklist);

let _instance: Dexie.Table<ChecklistDb, string> | undefined = undefined;

class ChecklistsDatabase extends OfflineDataDexieBase<ChecklistDb> {
    ChecklistsTable: Dexie.Table<ChecklistDb, string>;

    constructor(version: number) {
        const tableNameCannotBeRenamed = 'Checklists';
        super(databaseNamePreFix + version, tableNameCannotBeRenamed);
        //Database versioning: https://dexie.org/docs/Tutorial/Design#database-versioning

        this.version(1.0) //It is preferred to increment the version by 0.1.
            .stores({
                Checklists: 'id, tagNo, commPackNo, mcPackNo, tagProjectName'
            });
        //.upgrade(() => {});
        this.ChecklistsTable = this.table(tableNameCannotBeRenamed);
        _instance = this.ChecklistsTable;
    }
}

const checklistsDatabaseAdministrator = new DatabaseAdministrator(
    databaseNamePreFix,
    (version) => new ChecklistsDatabase(version)
);
export function checklistsAdministrator(): DatabaseAdministrator<ChecklistDb> {
    return checklistsDatabaseAdministrator;
}

export function checklistsRepository(): Repository<ChecklistDb> {
    return checklistsAdministrator().repositoryTransaction();
}

export async function checklistsSearchDb(
    tagNo?: string,
    commPackNo?: string,
    mcPackNo?: string,
    tagProjectName?: string,
    take = 500
): Promise<ChecklistDb[]> {
    if (!_instance) return [] as ChecklistDb[];

    const queryFirstValid = [
        { key: 'tagNo', value: tagNo },
        { key: 'commPackNo', value: commPackNo },
        { key: 'mcPackNo', value: mcPackNo },
        { key: 'tagProjectName', value: tagProjectName }
    ].find((item) => item.value) as KeyValue;

    if (!queryFirstValid) return [] as ChecklistDb[];
    const { key: firstKey, value: firstValue } = queryFirstValid;

    let query = _instance.where(firstKey).equals(firstValue);
    if (commPackNo && commPackNo !== firstValue) query = query.and((item) => item.commPackNo === commPackNo);
    if (mcPackNo && mcPackNo !== firstValue) query = query.and((item) => item.mcPackNo === mcPackNo);
    if (tagProjectName && tagProjectName !== firstValue)
        query = query.and((item) => item.tagProjectName === tagProjectName);

    const result = await query.limit(take).toArray();
    return result ?? ([] as ChecklistDb[]);
}

interface KeyValue {
    key: string;
    value: string;
}
