import {
    ArgumentDateError,
    extractPositiveFirstNumbers,
    getMaxNumberInCollectionOrOne,
    orEmpty,
    toDateOrThrowError,
    toDateOrUndefined
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
        var dateString = '2017-09-21T13:24:37';
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
        var dateString = '2017-09-21T13:24:37';
        const actual = toDateOrThrowError(dateString);
        expect(actual).toEqual(new Date(dateString));
    });
});
