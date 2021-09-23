import { loggerFactory } from '../../logger';
import { JsonParseError, SyncError } from '../../results/errors';
import { apiFetch, apiFetchJsonToArray } from '../../service/workerFetch';
import { ApiDataFetcher } from '../apiDataFetcher';
import { extractDateFromHeader, queryParameterOrEmpty } from '../apiHelper';
import { getApiBaseUrl } from '../syncSettings';
import { distinct } from '../Utils/distinct';
import { dateAsApiString } from '../Utils/stringUtils';
import { getMockedTagsString } from './tagMocked';
import { cleanupTag, TagSummaryDb } from './tagSummaryDb';

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

    return await _tagsApiFetcher.fetchAll(url, () => getMockedTagsString(50000), abortSignal);
}

export async function searchTagsOnline(
    searchText: string,
    instCode: string,
    maxHits: number,
    projectCode?: string,
    abortSignal?: AbortSignal
): Promise<TagSummaryDb[]> {
    maxHits = maxHits <= 0 ? maxHits : 25;
    let url = `${getApiBaseUrl()}/${instCode}/tags?take=${maxHits}`;
    url += queryParameterOrEmpty('tagNo', searchText);
    url += queryParameterOrEmpty('projectCode', projectCode);

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
        throw new JsonParseError(url, ex as Error); //TODO Ove as Error?
    }
}
