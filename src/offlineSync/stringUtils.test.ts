import { ArgumentDateError } from '../baseResult';
import {
    extractPositiveFirstNumbers,
    getMaxNumberInCollectionOrOne,
    orEmpty,
    toDateOrThrowError,
    toDateOrUndefined,
    toNumber
} from './stringUtils';

describe('extractPositiveNumbers', () => {
    it('should return empty if no number in string array', () => {
        expect(extractPositiveFirstNumbers(['not any number'])).toEqual([]);
    });

    it('should return the first number in each string as positive', () => {
        expect(extractPositiveFirstNumbers(['not any number', 'string with 1', '-2 and 3'])).toEqual([1, 2]);
    });
});

describe('getMaxNumberInCollectionOrOne', () => {
    it('should return 1 if no number in string array', () => {
        expect(getMaxNumberInCollectionOrOne(['not any number'])).toEqual(1);
    });

    it('should return the maximum of the first number in each string', () => {
        expect(getMaxNumberInCollectionOrOne(['not any number', 'string with 1', '-2 and 3'])).toEqual(2);
    });
});

describe('orEmpty', () => {
    it('should return empty if string is undefined', () => {
        expect(orEmpty()).toEqual('');
    });

    it('should return empty if string is empty', () => {
        expect(orEmpty('')).toEqual('');
    });

    it('should return same string if proper string', () => {
        expect(orEmpty('a proper string')).toEqual('a proper string');
    });
});

describe('toNumber', () => {
    it('should return same number if number', () => {
        expect(toNumber(-1234.56)).toEqual(-1234.56);
    });

    it('should return number if string is a valid number', () => {
        expect(toNumber('-1234.57')).toEqual(-1234.57);
    });

    it('should return NaN if string is undefined', () => {
        const undefinedAsUnknown = undefined as unknown;
        const undefinedString: string = undefinedAsUnknown as string;
        expect(toNumber(undefinedString)).toEqual(NaN);
    });

    it('should return NaN if string is empty', () => {
        expect(toNumber('')).toEqual(NaN);
    });

    it('should return NaN if its a string and not a number', () => {
        expect(toNumber('a proper string')).toEqual(NaN);
    });
});

describe('toDateOrUndefined', () => {
    it('should return undefined if string is empty', () => {
        const actual = toDateOrUndefined('');
        expect(actual).toEqual(undefined);
    });

    it('should return undefined if garbage string', () => {
        const actual = toDateOrUndefined('garbage');
        expect(actual).toEqual(undefined);
    });

    it('should return correct date if date', () => {
        const dateString = '2017-09-21T13:24:37';
        const actual = toDateOrUndefined(dateString);
        expect(actual).toEqual(new Date(dateString));
    });
});

describe('toDateOrThrowError', () => {
    it('should throw ArgumentDateError if string is empty', () => {
        expect(() => toDateOrThrowError('')).toThrowError(ArgumentDateError);
    });

    it('should return ArgumentDateError if garbage string', () => {
        expect(() => toDateOrThrowError('garbage')).toThrowError(ArgumentDateError);
    });

    it('should return correct date if date', () => {
        const dateString = '2017-09-21T13:24:37';
        const actual = toDateOrThrowError(dateString);
        expect(actual).toEqual(new Date(dateString));
    });
});
