import { loggerFactory } from '../../logger';
import { JsonParseError, SyncError } from '../../results/baseResult';
import { apiFetch, apiFetchJsonToArray } from '../../service/workerFetch';
import { ApiDataFetcher } from '../apiDataFetcher';
import { extractDateFromHeader, queryParameter } from '../apiHelper';
import { orEmpty, toDateOrThrowError } from '../stringUtils';
import { getApiBaseUrl, Settings } from '../syncSettings';
import { distinct } from '../Utils/distinct';
import { dateAsApiString } from '../Utils/stringUtils';
import { getMockedTagsString } from './tagMocked';
import { TagSummaryDb } from './tagSummaryDb';

const log = loggerFactory.tags('Api');

const _tagsApiFetcher = new ApiDataFetcher(cleanupTag);

export const tagsApi = {
    all: getAllTagsFromApi,
    updated: apiUpdatedTags,

    state: _tagsApiFetcher.state
};

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

export async function apiAllTags(instCode: string, abortSignal: AbortSignal): Promise<TagsData> {
    const url = `${getApiBaseUrl()}/${instCode}/archived-tags-file`;
    let dateSyncedAt: Date | undefined = undefined;
    const tags = await _tagsApiFetcher.fetchAll(
        url,
        () => getMockedTagsString(0),
        abortSignal,
        (response) => (dateSyncedAt = extractDateFromHeader(response, 'content-disposition'))
    );

    if (tagsApi.state.isMockEnabled) dateSyncedAt = new Date();
    if (!dateSyncedAt) throw new SyncError(`header content-disposition doesn't exist`); //Expected from api, something is wrong with api response

    log.trace('All Tags:', tags.length, dateSyncedAt, _tagsApiFetcher ? 'Using mock data' : '');
    return { tags, dataSyncedAt: dateSyncedAt };
}

export async function apiUpdatedTags(
    instCode: string,
    fromDate: Date,
    abortSignal: AbortSignal
): Promise<TagSummaryDb[]> {
    const date = dateAsApiString(fromDate);
    const url = `${getApiBaseUrl()}/${instCode}/tags?updatedSince=${date}&take=5000000`;

    const tags = await _tagsApiFetcher.fetchAll(url, () => getMockedTagsString(50000), abortSignal);
    return tags;
}

export async function searchTagsOnline(
    searchText: string,
    maxHits: number,
    instCode?: string,
    abortSignal?: AbortSignal
): Promise<TagSummaryDb[]> {
    maxHits = maxHits <= 0 ? maxHits : 25;
    instCode = instCode ?? Settings.getInstCode();
    let url = `${getApiBaseUrl()}/${instCode}/tags?take=${maxHits}`;
    url += queryParameter('tagNo', searchText);

    let results = await apiFetchJsonToArray<TagSummaryDb>(url, abortSignal);
    if (results.length < maxHits) {
        //TODO performance test - is it worth it?
        const descriptionResults = await apiFetchJsonToArray<TagSummaryDb>(url.replace('tagNo', 'description'));
        results = distinct(results.concat(descriptionResults), (tag) => tag.tagNo);
    }
    return results.slice(0, maxHits);
}

async function getAllTagsFromApi(instCode: string, abortSignal: AbortSignal): Promise<TagsData> {
    const url = `${getApiBaseUrl()}/${instCode}/archived-tags-file`;
    const response = await apiFetch(url, abortSignal); //TODO handle not ok, forbidden, etc

    try {
        const tags: TagSummaryDb[] = await JSON.parse(await response.text());
        return { tags, dataSyncedAt: extractDateFromHeader(response, 'content-disposition') } as TagsData;
    } catch (ex) {
        throw new JsonParseError(url, ex);
    }
}
