import Dexie from 'dexie';
import { chain, Dictionary } from 'lodash';
import { DatabaseAdministrator, getDatabaseName, OfflineDataDexieBase, Repository } from '../offlineDataDexieBase';
import { OfflineSystem } from '../offlineSystem';
import { ChecklistDb } from './checklistsApi';

const databaseNamePreFix = getDatabaseName(OfflineSystem.Checklist);

let _tableInstance: Dexie.Table<ChecklistDb, string> | undefined = undefined;

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
        _tableInstance = this.ChecklistsTable;
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

export async function getLocalProCoSysChecklistsGroupedByTagNo(tagNos: string[]): Promise<Dictionary<ChecklistDb[]>> {
    if (!_tableInstance) return {};
    return chain(await _tableInstance.where('tagNo').anyOf(tagNos).toArray())
        .groupBy((checklist) => checklist.tagNo)
        .value();
}

export async function checklistsSearchDb(
    tagNo?: string,
    commPackNo?: string,
    mcPackNo?: string,
    tagProjectName?: string,
    take = 500
): Promise<ChecklistDb[]> {
    if (!_tableInstance) return [] as ChecklistDb[];

    const queryFirstValid = [
        { key: 'tagNo', value: tagNo },
        { key: 'commPackNo', value: commPackNo },
        { key: 'mcPackNo', value: mcPackNo },
        { key: 'tagProjectName', value: tagProjectName }
    ].find((item) => item.value) as KeyValue;

    if (!queryFirstValid) return [] as ChecklistDb[];
    const { key: firstKey, value: firstValue } = queryFirstValid;

    let query = _tableInstance.where(firstKey).equals(firstValue);
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
