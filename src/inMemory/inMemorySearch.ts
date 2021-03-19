import { logPerformance } from '../logger';
import { asAlphaNumeric, getAllWordsAsAlphaNumericUpperCase } from '../offlineSync/Utils/util';

/**
 * Search the collection and return results sorted on best match.
 * @param collection The collection to search through.
 * @param getSearchableFieldsPrioritizedFunc Function for extracting the string fields from T that should be searched, first field is prioritized.
 * @param searchText The text to search for.
 * @param maxHits Maximum number of search results wanted. Returns early if we have fairly accurate hits.
 * @param typeNameForLogging A friendly name used for identifying the log.*
 * @param alwaysPerformanceLogging Set to true to always log performance time.
 */
export function searchOrderedByBestMatch<T>(
    collection: ReadonlyArray<T>,
    getSearchableFieldsPrioritizedFunc: (arg: T) => string[],
    searchText: string,
    maxHits: number,
    typeNameForLogging: string,
    alwaysPerformanceLogging = false //TODO Ove
): T[] {
    const performanceLogger = logPerformance();
    const results = searchOrderedByBestMatchLogic(collection, getSearchableFieldsPrioritizedFunc, searchText, maxHits);
    performanceLogger.forceLog(`${typeNameForLogging} BestMatch Search (${searchText}) found(${results.length})`);
    return results;
}

/**
 * Search the collection and return results sorted on best match.
 * @param collection The collection to search through.
 * @param getSearchableFieldsPrioritizedFunc Function for extracting the string fields from T that should be searched, first field is prioritized.
 * @param searchText The text to search for.
 * @param maxHits Maximum number of search results wanted. Returns early if we have fairly accurate hits.
 */
export function searchOrderedByBestMatchLogic<T>(
    collection: ReadonlyArray<T>,
    getSearchableFieldsPrioritizedFunc: (arg: T) => string[],
    searchText: string,
    maxHits: number
): T[] {
    const searchTextWords = getAllWordsAsAlphaNumericUpperCase(searchText);
    if (searchTextWords.length === 0) {
        return [];
    }

    type scoreItem = { score: number; item: T };
    const results = [] as scoreItem[];

    let perfectHits = 0;
    for (let index = 0; perfectHits < maxHits && index < collection.length; index++) {
        const item = collection[index];
        const score = searchMatchScore(getSearchableFieldsPrioritizedFunc(item), searchTextWords);
        if (score >= perfectHit) perfectHits++;
        if (score > 0) results.push({ score, item });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, maxHits).map((x) => x.item);
}

const perfectHit = 10;
const goodHit = 5;
const otherHit = 1;

/**
 * This function tries to give a score if all search text is included in the searchable Words.
 * The first searchable word (usually serialNo/key) is prioritized. 2nd priority if any searchable starts with a searchText.
 * The algorithm is not perfect, but is a tradeoff between accuracy and performance. Be careful when changing it, to not degrade the performance.
 * @param searchableWords The words to search in.
 * @param searchTextsAsAlphaNumericUpperCase The search text (typed by user). Has to be converted to AlphaNumericUpperCase on the outside because of performance.
 */
function searchMatchScore(
    searchableWords: (string | undefined)[],
    searchTextsAsAlphaNumericUpperCase: string[]
): number {
    const searchables = asAlphaNumericUpperCase(searchableWords);
    const texts = searchTextsAsAlphaNumericUpperCase;
    const containsAll = SearchMustIncludeAll(searchables, texts);
    if (!containsAll) return 0;

    if (texts.length === 1) {
        const position = searchables[0].indexOf(texts[0]);
        //stars with
        if (position === 0) return perfectHit + 1;
        //first searchable includes longer first searchWord
        if (position >= 0 && minLength(texts[0], 5)) return perfectHit;
        //first searchable includes shorter searchWord, the closer to start, the higher priority
        else if (position >= 0) {
            const scoreByDistanceToStart = perfectHit + 1 - position / 3;
            return scoreByDistanceToStart > otherHit + 1 ? scoreByDistanceToStart : otherHit + 2;
        }
        //the rest of the searchable starts with searchText
        if (searchables.slice(1).some((searchable) => searchable.startsWith(texts[0]))) return otherHit + 1;
    } else {
        //first searchable starts with first search text
        if (minLength(texts[0], 2) && searchables[0].startsWith(texts[0])) return perfectHit + 1;
        //first searchable includes all search text
        if (texts.every((searchWord) => searchables[0].includes(searchWord))) return perfectHit;
        //first searchable includes 2 or more of search text
        if (texts.length > 2 && texts.filter((text) => minLength(text, 2) && searchables[0].includes(text)).length > 1)
            return perfectHit;

        //first searchable includes any of the search texts longer than 2 characters
        if (texts.some((searchText) => minLength(searchText, 2) && searchables[0].includes(searchText)))
            return goodHit + 1;
        //one of the searchables starts with one of the searchTexts
        if (
            searchables
                .slice(1)
                .some((searchable) => texts.some((text) => minLength(text, 2) && searchable.startsWith(text)))
        )
            return goodHit;
    }

    return otherHit;
}

/**
 * Returns true if any of the searchableWords matches all words in the searchText.
 * It uses alphaNumeric comparison, so all special characters are stripped away.
 */
export function searchIn(searchableWords: (string | undefined)[], searchText: string): boolean {
    const searchableWordsFiltered = asAlphaNumericUpperCase(searchableWords);
    const searchTextWords = getAllWordsAsAlphaNumericUpperCase(searchText);

    return SearchMustIncludeAll(searchableWordsFiltered, searchTextWords);
}

function SearchMustIncludeAll(searchableWordsFiltered: string[], allSearchWords: string[]): boolean {
    return allSearchWords.every((searchWord) =>
        searchableWordsFiltered.some((searchableItem) => searchableItem.includes(searchWord))
    );
}

function asAlphaNumericUpperCase(searchableWords: (string | undefined)[]): string[] {
    return searchableWords.map((item) => asAlphaNumeric(item ? item : '').toUpperCase()).filter((x) => x !== '');
}

function minLength(text: string, minimumLength: number): boolean {
    return text.length >= minimumLength;
}
