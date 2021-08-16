import { uniq } from 'lodash';

/**
 * Strips away all special characters as: (-" &@) etc, but keeps all letters and numbers.
 * [Markdown](https://regex101.com/r/U2LJE0/7/)
 */
export function asAlphaNumeric(item?: string): string {
    if (!item) return '';
    // //return item.replace(/[\W_]/gi, ''); //inField, no support for norwegian characters
    return item.replace(/[-_;:'",. §|!"#¤%&/()=?`]/gi, ''); //support norwegian letters and strip away many special characters

    //Probably more precise but too slow (lets keep this code for now for reference later):
    //https://regex101.com/r/U2LJE0/7/
    // const matches = item.match(/[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/gi);
    // if (!matches) return '';
    // return matches.join('');
}

export function asAlphaNumericUpperCase(item?: string): string {
    if (!item) return '';
    return asAlphaNumeric(item).toUpperCase();
}

/**
 * Splits by space and return all words as alphaNumeric uppercase.
 */
export function getAllWordsAsAlphaNumericUpperCase(text?: string): string[] {
    if (!text) {
        return [] as string[];
    }

    return uniq(
        text
            .toUpperCase()
            .split(' ')
            .map((item) => asAlphaNumeric(item))
            .filter((item) => item !== '')
    );
}

export const sleep = (ms: number): Promise<unknown> => new Promise((res) => setTimeout(res, ms));

export function chunkArray<T>(array: T[], size: number): T[][] {
    if (!array) return [];

    const chunkedArray = [] as T[][];
    let index = 0;
    while (index < array.length) {
        chunkedArray.push(array.slice(index, size + index));
        index += size;
    }
    return chunkedArray;
}
