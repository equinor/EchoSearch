import { logPerformance } from '../../logger';
import { orEmpty } from '../stringUtils';
import { getMockedTagsString } from './tagMocked';
import { TagStatus, TagSummaryDb } from './tagSummaryDb';

export interface TagsData {
    tags: TagSummaryDb[];
    dataSyncedAt: Date;
}

function getMockedTags(): TagsData {
    const temp = getMockedTagsString(0);
    const tags: TagSummaryDb[] = JSON.parse(temp);
    const filename = 'JSVTags_22_2020-10-15_Tags408448_Estimated409496.json.gz';
    return { tags, dataSyncedAt: ExtractDate(filename) } as TagsData;
}

function cleanupTag(tag: TagSummaryDb): TagSummaryDb {
    return {
        tagNo: tag.tagNo,
        description: orEmpty(tag.description),
        tagCategoryDescription: orEmpty(tag.tagCategoryDescription),
        tagStatus: tag.tagStatus,
        tagStatusDescription: orEmpty(tag.tagStatusDescription),
        tagType: orEmpty(tag.tagType)
    };
}

function cleanupTags(tags: TagSummaryDb[]): TagSummaryDb[] {
    return tags.map((tag) => cleanupTag(tag));
}

export async function apiAllTags(): Promise<TagsData> {
    const tagData = getMockedTags();
    tagData.tags = cleanupTags(tagData.tags);
    return tagData;
}

export async function apiUpdatedTags(fromDate: Date): Promise<TagsData> {
    const mockedTags = 100000;
    const tagString = getMockedTagsString(mockedTags);
    const p = logPerformance();
    const tags: TagSummaryDb[] = JSON.parse(tagString);
    p.forceLog('json parse ' + mockedTags);
    return { tags: cleanupTags(tags), dataSyncedAt: new Date() } as TagsData;
}

function ExtractDate(stringWithDate: string): Date {
    const regex = /(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{1,4})/g;
    const dateStrings = stringWithDate?.match(regex) as string[];
    var date = new Date(dateStrings[0]);
    return date;
}

export async function searchTagsOnline(searchText: string, maxHits: number): Promise<TagSummaryDb[]> {
    return [
        {
            tagNo: 'online search found ' + searchText,
            description: 'This is a mocked online search ' + maxHits,
            tagStatus: TagStatus.AsBuilt,
            tagCategoryDescription: 'Mechanical',
            tagStatusDescription: 'As Built description',
            tagType: 'A tag type'
        } as TagSummaryDb
    ];
}

// export async function getAllTagData(dto: PlantDataRequest): Promise<AllDataResult> {
//     const regex = /(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{1,4})/g;
//     const url = `${baseApiUrl}/${dto.instCode}/archived-tags-file`;
//     let tags: Tag[] = [];
//     const response = await EchoCore.EchoClient.fetch(url);

//     try {
//         tags = await JSON.parse(await response.text());
//     } catch (ex) {
//         throw new JsonParseError(url, ex);
//     }
//     let dateSynced: string[] = [];
//     if (response && response.headers && response.headers.get('content-disposition')) {
//         dateSynced = response.headers.get('content-disposition')?.match(regex) as string[];
//     }

//     return { dataResult: tags, dateSynced: dateSynced[0] } as AllDataResult;
// }
