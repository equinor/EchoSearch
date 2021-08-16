import { queryParameters } from './apiHelper';

describe('queryParameters', () => {
    it('should url encode all data types', () => {
        const actual = queryParameters([
            { key: 'aString', value: 'a b c' },
            { key: 'aBoolean', value: false },
            { key: 'aNumber', value: 42 },
            { key: 'aDate', value: new Date('2021-01-19T01:00:01') }
        ]);
        console.log(actual);
        const expected = '?aString=a%20b%20c&aBoolean=false&aNumber=42&aDate=2021-01-19T01:00:01.000Z';
        expect(actual).toBe(expected);
    });

    it('should dismiss undefined types', () => {
        const actual = queryParameters([
            { key: 'aUndefined', value: undefined },
            { key: 'anEmptyString', value: '' }
        ]);
        console.log(actual);
        const expected = '';
        expect(actual).toBe(expected);
    });

    it('should throw if invalid date', () => {
        const t = () => queryParameters([{ key: 'aUndefined', value: new Date('invalid') }]);
        expect(t).toThrowError();
    });
});
