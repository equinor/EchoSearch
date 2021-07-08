import Dexie from 'dexie';
import { loggerFactory } from '../../logger';
import { DatabaseAdministrator, getDatabaseName, OfflineDataDexieBase, Repository } from '../offlineDataDexieBase';
import { OfflineSystem } from '../syncSettings';
import { TagStatus, TagSummaryDb } from './tagSummaryDb';

const databaseNamePreFix = getDatabaseName(OfflineSystem.Tags);

const log = loggerFactory.tags('Repository');

class TagsDatabase extends OfflineDataDexieBase<TagSummaryDb> {
    Tags: Dexie.Table<TagSummaryDb, string>;

    constructor(version: number) {
        const tableNameCannotBeRenamed = 'Tags';
        super(databaseNamePreFix + version, tableNameCannotBeRenamed);

        //Database versioning: https://dexie.org/docs/Tutorial/Design#database-versioning
        //=== Old Databases here - don't change this code, needed for migration ===

        this.version(1.0) //It is preferred to increment the version by 0.1.
            .stores({
                Tags: 'tagNo'
            });
        this.Tags = this.table(tableNameCannotBeRenamed);
        this.on('ready', dbIsReady);
    }
}

const tagsDatabaseAdministrator = new DatabaseAdministrator(databaseNamePreFix, (version) => new TagsDatabase(version));
export function tagsAdministrator(): DatabaseAdministrator<TagSummaryDb> {
    return tagsDatabaseAdministrator;
}

export function tagsRepository(): Repository<TagSummaryDb> {
    return tagsAdministrator().repository();
}

function dbIsReady(): void {
    log.trace('-- TagsDatabase is now ready --');
}

// export async function getLocalTag(tagNo: string): Promise<TagSummaryDb | undefined> {
//     return await instance().Tags.where('tagNo').equals(tagNo).first();
// }

// export async function getLocalTags(tagNos: string[]): Promise<TagSummaryDb[] | undefined> {
//     return await instance().Tags.where('tagNo').anyOf(tagNos).toArray();
// }

// export async function getLocalTagStatuses(tagNos: string[]): Promise<Dictionary<string>> {
//     return (await instance().Tags.where('tagNo').anyOf(tagNos).toArray()).reduce(
//         (r: Dictionary<string>, tag: TagSummaryDb) => {
//             r[tag.tagNo] = tag.tagStatus;
//             return r;
//         },
//         {}
//     );
// }

export function createFakeDatabases(): void {
    console.log('create fake databases NOT IMPLEMENTED');
    let offlineDb = new TagsDatabase(6);
    offlineDb.Tags.add(getTag());
    offlineDb = new TagsDatabase(7);
    offlineDb.Tags.add(getTag());
    offlineDb = new TagsDatabase(3);
    offlineDb.Tags.add(getTag());
    offlineDb = new TagsDatabase(2);
    offlineDb.Tags.add(getTag());
}

function getTag(): TagSummaryDb {
    return {
        tagNo: '1',
        tagCategoryDescription: '2',
        tagStatus: TagStatus.AsBuilt,
        tagType: '5',
        description: '6',
        locationCode: 'A00',
        updatedDate: new Date(2021, 1, 1)
    };
}
