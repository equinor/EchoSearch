import { asAlphaNumeric, getAllWordsAsAlphaNumericUpperCase } from './util';

describe('asAlphaNumeric', () => {
    it('should strip away special characters', () => {
        const expected = 'A73MA001';
        const actual = asAlphaNumeric('A-7 3  M,:,_A001');
        expect(actual).toEqual(expected);
    });
    it('should return empty string if input is undefined', () => {
        const expected = '';
        const value: string | undefined = undefined;
        const actual = asAlphaNumeric(value);
        expect(actual).toEqual(expected);
    });
    it('should should remove spaces', () => {
        const expected = 'noSpace';
        const actual = asAlphaNumeric('no Space');
        expect(actual).toEqual(expected);
    });
    it('should distinguish lower and upper case', () => {
        const expected = 'smallLARGE';
        const actual = asAlphaNumeric('smallLARGE');
        expect(actual).toEqual(expected);
    });
    it('should support norwegian letters', () => {
        const expected = 'æøå';
        const actual = asAlphaNumeric('æøå');
        expect(actual).toEqual(expected);
    });
});

describe('getAllWordsAsAlphaNumericUpperCase', () => {
    it('should return all words separated by space and strip away special characters', () => {
        const expected = ['THIS', 'IS', 'SEVERAL', 'WORDS', 'ANSWER42'];
        const actual = getAllWordsAsAlphaNumericUpperCase('t-his is     ;several words answer42');
        expect(actual).toEqual(expected);
    });
    it('should return empty string if input is undefined', () => {
        const expected = [] as string[];
        const value: string | undefined = undefined;
        const actual = getAllWordsAsAlphaNumericUpperCase(value);
        expect(actual).toEqual(expected);
    });
});
