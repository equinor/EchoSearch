import { logPerformance } from '../logger';
import { TagSummaryDb } from '../offlineSync/tagSyncer/tagSummaryDb';
import { asAlphaNumericUpperCase } from '../offlineSync/Utils/util';

let _sortedInMemoryTags: TagNoAlphaNumeric[] = [];
let _isInMemoryTagsInitialized = false;

interface TagNoAlphaNumeric {
    tagNo: string;
    tagNoAlphaNumericUpperCase: string;
    descriptionAlphaNumericUpperCase: string;
}

export function isInMemoryTagsReady(): boolean {
    return _isInMemoryTagsInitialized;
}

export function clearAndInitInMemoryTags(tags: TagSummaryDb[]): void {
    clearInMemoryTags();
    _isInMemoryTagsInitialized = false;
    const performanceLogger = logPerformance();

    const tags2 = tags
        ? tags.map((item) => {
              return {
                  tagNo: item.tagNo,
                  tagNoAlphaNumericUpperCase: asAlphaNumericUpperCase(item.tagNo),
                  descriptionAlphaNumericUpperCase: asAlphaNumericUpperCase(item.description)
              } as TagNoAlphaNumeric;
          })
        : ([] as TagNoAlphaNumeric[]);
    performanceLogger.log(`InMemoryTags Map all tags to alphaNumeric(${tags.length})`);

    tags2.sort((a, b) => a.tagNo.localeCompare(b.tagNo));
    performanceLogger.logDelta(`InMemoryTags Sort all alphaNumeric tags(${tags.length})`);

    _sortedInMemoryTags = tags2;
    _isInMemoryTagsInitialized = true;
    performanceLogger.forceLog(`InMemoryTags clear and init new Tags DONE (${tags.length})`);
}

export function updateInMemoryTags(updatedTags: TagSummaryDb[]): void {
    const performanceLogger = logPerformance();

    for (let index = 0; index < updatedTags.length; index++) {
        const updatedTag = mapTo(updatedTags[index]);
        const indexFound = indexOfBinarySearch(updatedTag.tagNo);
        if (indexFound >= 0) {
            _sortedInMemoryTags[indexFound].descriptionAlphaNumericUpperCase =
                updatedTag.descriptionAlphaNumericUpperCase;
        } else {
            _sortedInMemoryTags.push(updatedTag);
        }
    }
    _sortedInMemoryTags.sort((a, b) => a.tagNo.localeCompare(b.tagNo));
    performanceLogger.log(`InMemoryTags updated tags (${updatedTags.length})`);
}

export function isTag(possibleTagNo: string): boolean {
    const index = indexOfBinarySearch(possibleTagNo);
    return index >= 0;
}

function indexOfBinarySearch(tagNo: string): number {
    let minNum = 0;
    let maxNum = _sortedInMemoryTags.length - 1;

    while (minNum <= maxNum) {
        const mid = Math.floor((minNum + maxNum) / 2);
        if (tagNo === _sortedInMemoryTags[mid].tagNo) {
            return mid;
        } else if (tagNo.localeCompare(_sortedInMemoryTags[mid].tagNo) < 0) {
            maxNum = mid - 1;
        } else {
            minNum = mid + 1;
        }
    }

    return -1;
}

function mapTo(tag: TagSummaryDb): TagNoAlphaNumeric {
    return {
        tagNo: tag.tagNo,
        tagNoAlphaNumericUpperCase: asAlphaNumericUpperCase(tag.tagNo),
        descriptionAlphaNumericUpperCase: asAlphaNumericUpperCase(tag.description)
    } as TagNoAlphaNumeric;
}

export function getInMemoryTagsSorted(): ReadonlyArray<TagNoAlphaNumeric> {
    return _sortedInMemoryTags;
}

export function inMemoryTagsCount(): number {
    return _sortedInMemoryTags.length;
}

export function clearInMemoryTags(): void {
    _sortedInMemoryTags = [];
    _isInMemoryTagsInitialized = false;
}
