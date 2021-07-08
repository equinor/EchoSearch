import { loggerFactory } from '../logger';
import { tagsRepository } from '../offlineSync/tagSyncer/tagRepository';
import { TagSummaryDb } from '../offlineSync/tagSyncer/tagSummaryDb';
import { asAlphaNumeric, getAllWordsAsAlphaNumericUpperCase } from '../offlineSync/Utils/util';
import { getInMemoryTagsSorted } from './inMemoryTags';
import { tagsLevTrie } from './inMemoryTagsLevTrie';
import { TrieResult } from './trie/levTrie';

const log = loggerFactory.tags('InMemory.Search');

export function searchForClosestTagNo(tagNo: string): TrieResult | undefined {
    //TODO should we return not ready if it hasn't been init yet?
    const tagNoCleaned = asAlphaNumeric(tagNo);
    const maybeTagAlphaNumeric = tagsLevTrie.instance().closest(tagNoCleaned, 6);

    if (maybeTagAlphaNumeric === undefined) {
        log.info('No match found for ', tagNo, 'has Tags in LevTrie:', tagsLevTrie.isReady());
        return;
    }

    const fullTagNo = getInMemoryTagsSorted().find(
        (item) => item.tagNoAlphaNumericUpperCase === maybeTagAlphaNumeric.word
    );
    if (fullTagNo === undefined) {
        log.error(
            "found match, but couldn't find fullTagNo (this should never happen, bug in code..): ",
            maybeTagAlphaNumeric
        );
        return;
    }

    log.info('Found', fullTagNo, maybeTagAlphaNumeric.cost);
    return { word: fullTagNo.tagNo, cost: maybeTagAlphaNumeric.cost } as TrieResult;
}

export async function searchTags(searchText: string, maxHits: number): Promise<TagSummaryDb[]> {
    const allSearchWords = getAllWordsAsAlphaNumericUpperCase(searchText);
    if (allSearchWords.length === 0) {
        return [] as TagSummaryDb[];
    }

    const performance = log.performance();
    const tags = await searchInMemoryTagNosIncludesAllInDescription(allSearchWords, maxHits);
    performance.forceLog(`Full Tag Search (${searchText}) found(${tags.length})`);
    return tags;
}

async function searchInMemoryTagNosIncludesAllInDescription(
    allSearchWords: string[],
    maxHits: number
): Promise<TagSummaryDb[]> {
    const performance = log.performance();
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
    performance.logDelta(`3.0 Tag Search in Memory with description (${allSearchWords}) found(${results.length})`);

    const tagResults = await tagsRepository().bulkGet(results);
    performance.log(`3.1 Tag Search bulk get from indexDb (${results.length})`);

    if (tagResults.error) log.error(tagResults.error);

    return tagResults.data;
}
