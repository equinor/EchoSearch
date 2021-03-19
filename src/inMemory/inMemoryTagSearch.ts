import { logError, logInfo, postNotificationPerformance } from '../logger';
import { tagsRepository } from '../offlineSync/tagSyncer/tagRepository';
import { TagSummaryDb } from '../offlineSync/tagSyncer/tagSummaryDb';
import { asAlphaNumeric, getAllWordsAsAlphaNumericUpperCase } from '../offlineSync/Utils/util';
import { getInMemoryTagsSorted } from './inMemoryTags';
import { LevTrie, TrieResult } from './trie/levTrie';

/*
 *  @GET | POST | CLEAR
 *  Handling indexDB local plant data for offline search.
 */

let levTrie: LevTrie = new LevTrie();
let hasTagsInLevTrie = false;

export function clearLevTrie(): void {
    levTrie = new LevTrie();
}

export async function populateLevTrieWithTags(tagNos: string[]): Promise<void> {
    const timeStart = performance.now();
    tagNos.forEach((tagNo) => {
        const cleanedTagNo = asAlphaNumeric(tagNo);
        if (cleanedTagNo.length > 3) {
            levTrie.addWord(cleanedTagNo);
        }
    });
    hasTagsInLevTrie = hasTagsInLevTrie || tagNos.length > 0;

    postNotificationPerformance('Camera tags ready: ' + tagNos.length + ' of ' + tagNos.length, timeStart, true);
}

export const isSearchForTagNoReady = (): boolean => hasTagsInLevTrie;

export function searchForClosestTagNo(tagNo: string): TrieResult | undefined {
    const tagNoCleaned = asAlphaNumeric(tagNo);
    const maybeTagAlphaNumeric = levTrie.closest(tagNoCleaned, 6);

    if (maybeTagAlphaNumeric === undefined) {
        logInfo('No match found for ', tagNo, 'has Tags in LevTrie:', hasTagsInLevTrie);
        return;
    }

    const fullTagNo = getInMemoryTagsSorted().find(
        (item) => item.tagNoAlphaNumericUpperCase === maybeTagAlphaNumeric.word
    );
    if (fullTagNo === undefined) {
        logError(
            "found match, but couldn't find fullTagNo (this should never happen, bug in code..): ",
            maybeTagAlphaNumeric
        );
        return;
    }

    logInfo('Found', fullTagNo, maybeTagAlphaNumeric.cost);
    return { word: fullTagNo.tagNo, cost: maybeTagAlphaNumeric.cost } as TrieResult;
}

export async function searchTags(searchText: string, maxHits: number): Promise<TagSummaryDb[]> {
    const allSearchWords = getAllWordsAsAlphaNumericUpperCase(searchText);
    if (allSearchWords.length === 0) {
        return [] as TagSummaryDb[];
    }

    const t0 = performance.now();
    const tags = await searchInMemoryTagNosIncludesAllInDescription(allSearchWords, maxHits);
    postNotificationPerformance(`Full Tag Search (${searchText}) found(${tags.length})`, t0, true);
    return tags;
}

async function searchInMemoryTagNosIncludesAllInDescription(
    allSearchWords: string[],
    maxHits: number
): Promise<TagSummaryDb[]> {
    let startTime = performance.now();
    const allTags = getInMemoryTagsSorted();

    const perfectHits = [] as string[];
    const goodHits = [] as string[];
    const otherHits = [] as string[];

    for (let index = 0; perfectHits.length < maxHits && index < allTags.length; index++) {
        const tag = allTags[index];
        if (
            allSearchWords.every(
                (searchItemText) =>
                    tag.tagNoAlphaNumericUpperCase.includes(searchItemText) ||
                    tag.descriptionAlphaNumericUpperCase.includes(searchItemText)
            )
        ) {
            if (tag.tagNoAlphaNumericUpperCase.startsWith(allSearchWords[0])) perfectHits.push(tag.tagNo);
            else if (tag.tagNoAlphaNumericUpperCase.includes(allSearchWords[0])) goodHits.push(tag.tagNo);
            else otherHits.push(tag.tagNo);
        }
    }

    const results = perfectHits.concat(goodHits, otherHits).slice(0, maxHits);
    postNotificationPerformance(
        `3.0 Tag Search in Memory with description (${allSearchWords}) found(${results.length})`,
        startTime,
        false
    );

    startTime = performance.now();
    const tagResults = await tagsRepository().bulkGet(results);
    postNotificationPerformance(`3.1 Tag Search bulk get from indexDb (${results.length})`, startTime, false);

    return tagResults;
}
