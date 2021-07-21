import { JsonParseError, SyncError } from '../../baseResult';
import { loggerFactory } from '../../logger';
import { apiFetch, apiFetchJsonToArray } from '../../service/workerFetch';
import { queryParameter } from '../apiHelper';
import { orEmpty, toDateOrThrowError } from '../stringUtils';
import { baseApiUrl, getInstCode, Settings } from '../syncSettings';
import { ToggleState } from '../toggleState';
import { distinct } from '../Utils/distinct';
import { dateAsApiString } from '../Utils/stringUtils';
import { getMockedTagsString } from './tagMocked';
import { TagSummaryDb } from './tagSummaryDb';

const log = loggerFactory.tags('Api');

const _mock = new ToggleState(false);
export const tagsMock = _mock;

export interface TagsData {
    tags: TagSummaryDb[];
    dataSyncedAt: Date;
}

function cleanupTag(tag: TagSummaryDb): TagSummaryDb {
    return {
        tagNo: tag.tagNo,
        description: orEmpty(tag.description),
        tagCategoryDescription: orEmpty(tag.tagCategoryDescription),
        tagStatus: tag.tagStatus,
        tagType: orEmpty(tag.tagType),
        locationCode: orEmpty(tag.locationCode),
        updatedDate: toDateOrThrowError(tag.updatedDate)
    };
}

function cleanupTags(tags: TagSummaryDb[]): TagSummaryDb[] {
    return tags.map((tag) => cleanupTag(tag));
}

export async function apiAllTags(abortSignal: AbortSignal): Promise<TagsData> {
    const tagData = _mock.isEnabled ? getMockedTags() : await getAllTagsFromApi(getInstCode(), abortSignal);
    tagData.tags = cleanupTags(tagData.tags);
    log.trace('All Tags:', tagData.tags.length, tagData.dataSyncedAt, _mock.isEnabled ? 'Using mock data' : '');
    return tagData;
}

export async function apiUpdatedTags(fromDate: Date, abortSignal: AbortSignal): Promise<TagsData> {
    const tags = _mock.isEnabled
        ? getMockedUpdatedTags()
        : await getUpdatedTagFromApi(getInstCode(), fromDate, abortSignal);
    log.trace('Updated Tags:', tags.length, _mock.isEnabled ? 'Using mock data' : '');
    return { tags: cleanupTags(tags), dataSyncedAt: new Date() } as TagsData;
}

function ExtractDate(stringWithDate: string): Date {
    const regex = /(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{1,4})/g;
    const dateStrings = stringWithDate?.match(regex) as string[];
    return new Date(dateStrings[0]);
}

export async function searchTagsOnline(
    searchText: string,
    maxHits: number,
    instCode?: string,
    abortSignal?: AbortSignal
): Promise<TagSummaryDb[]> {
    maxHits = maxHits <= 0 ? maxHits : 25;
    instCode = instCode ?? Settings.getInstCode();
    let url = `${baseApiUrl}/${instCode}/tags?take=${maxHits}`;
    url += queryParameter('tagNo', searchText);

    let results = await apiFetchJsonToArray<TagSummaryDb>(url, abortSignal);
    if (results.length < maxHits) {
        //TODO performance test - is it worth it?
        const descriptionResults = await apiFetchJsonToArray<TagSummaryDb>(url.replace('tagNo', 'description'));
        results = distinct(results.concat(descriptionResults), (tag) => tag.tagNo);
    }
    return results.slice(0, maxHits);
}

function extractDateFromHeader(response: Response, headerName: string): Date {
    if (response && response.headers && response.headers.get(headerName)) {
        const regex = /(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{1,4})/g;
        const dates = response.headers.get(headerName)?.match(regex) as string[];
        return new Date(dates[0]);
    }
    throw new SyncError(`header (${headerName}) doesn't exist`); //Expected from api, something is wrong with api response
}

async function getAllTagsFromApi(instCode: string, abortSignal: AbortSignal): Promise<TagsData> {
    const url = `${baseApiUrl}/${instCode}/archived-tags-file`;
    let tags: TagSummaryDb[] = [];
    const response = await apiFetch(url, abortSignal); //TODO handle not ok, forbidden, etc

    try {
        tags = await JSON.parse(await response.text());
    } catch (ex) {
        throw new JsonParseError(url, ex);
    }

    return { tags, dataSyncedAt: extractDateFromHeader(response, 'content-disposition') } as TagsData;
}

async function getUpdatedTagFromApi(
    instCode: string,
    updatedSince: Date,
    abortSignal: AbortSignal
): Promise<TagSummaryDb[]> {
    //used for testing const date = '2020-11-27T06:52:57.199Z';
    const date = dateAsApiString(updatedSince);
    const url = `${baseApiUrl}/${instCode}/tags?updatedSince=${date}&take=5000000`;
    return await apiFetchJsonToArray<TagSummaryDb>(url, abortSignal);
}

function getMockedTags(): TagsData {
    const temp = getMockedTagsString(0);
    const tags: TagSummaryDb[] = JSON.parse(temp);
    const filename = 'JSVTags_22_2020-10-15_Tags408448_Estimated409496.json.gz';
    return { tags, dataSyncedAt: ExtractDate(filename) } as TagsData;
}

function getMockedUpdatedTags(): TagSummaryDb[] {
    const mockedTags = 100000;
    const tagString = getMockedTagsString(mockedTags);
    const p = log.performance();
    const tags: TagSummaryDb[] = JSON.parse(tagString);
    p.forceLog('json parse ' + mockedTags);
    return tags;
}
