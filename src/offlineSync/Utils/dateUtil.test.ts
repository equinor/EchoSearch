import { getMaxDate, getMaxDateFunc, getMaxDateInCollection, minusOneDay } from './dateUtils';

describe('getMaxDate', () => {
    it('should get max date', () => {
        expect(getMaxDate(new Date('2020-01-19T01:00:01'), new Date('2019-01-19T01:00:01'))).toEqual(
            new Date('2020-01-19T01:00:01')
        );
    });

    it('should handle 1 undefined and still get max date', () => {
        expect(getMaxDate(new Date('2020-01-19T01:00:01'))).toEqual(new Date('2020-01-19T01:00:01'));
    });

    it('should handle undefined and return undefined', () => {
        expect(getMaxDate()).toEqual(undefined);
    });
});

describe('getMaxDateInCollection', () => {
    it('should handle undefined and actual values', () => {
        const expected = new Date('2020-01-19T01:00:01');
        const actual = getMaxDateInCollection([expected, undefined]);
        expect(actual).toEqual(expected);
    });

    it('should handle all undefined', () => {
        const actual = getMaxDateInCollection([undefined, undefined]);
        expect(actual).toEqual(undefined);
    });

    it('should return max date', () => {
        const expected = '2020-01-19T01:00:01';
        const actual = getMaxDateInCollection([
            new Date('2020-01-19T01:00:00'),
            new Date(expected),
            new Date('2019-01-19T01:00:01'),
            undefined
        ]);
        expect(actual).toEqual(new Date(expected));
    });
});

describe('getMaxDateFunc', () => {
    it('should handle null and actual values', () => {
        const date = '2020-01-19T01:00:01';
        const expected = new Date(date);
        const actual = getMaxDateFunc(parseJsonDates(null, date), (item) => [item.date1, item.date2]);
        expect(actual).toEqual(expected);
        const actual2 = getMaxDateFunc(parseJsonDates(date, null), (item) => [item.date1, item.date2]);
        expect(actual2).toEqual(expected);
    });

    it('should handle all nulls', () => {
        const actual = getMaxDateFunc(parseJsonDates(null, null), (item) => [item.date1, item.date2]);
        expect(actual).toEqual(undefined);
    });

    it('should return max date', () => {
        const expected = '2020-01-19T01:00:01';
        const dates: DateObject[] = [
            { date1: new Date('2019-01-19T01:00:01'), date2: new Date('2018-01-19T01:00:01') },
            { date1: new Date('2019-01-19T01:00:01'), date2: undefined },
            { date1: undefined, date2: new Date('2017-01-19T01:00:01') },
            { date1: new Date('2017-01-19T01:00:01'), date2: new Date(expected) }
        ];
        const actual = getMaxDateFunc(dates, (item) => [item.date1, item.date2]);
        expect(actual).toEqual(new Date(expected));
    });
});

describe('minusOneDay', () => {
    it('should handle actual date value', () => {
        const date = new Date('2020-01-19T01:00:01');
        const expected = new Date('2020-01-18T01:00:01');
        const actual = minusOneDay(date);
        expect(actual).toEqual(expected);
    });

    it('should handle null', () => {
        const jsonDate = parseJsonDates(null, null)[0].date1;
        console.log('jsonDate:', jsonDate);
        const expected = undefined;
        const actual = minusOneDay(jsonDate);
        expect(actual).toEqual(expected);
    });

    it('should handle date disguised as a string', () => {
        const stringDateDisguisedAsDate = parseJsonDates('2020-01-18T01:00:01', '2020-01-19T01:00:01')[0].date1;
        const expected = new Date('2020-01-17T01:00:01');
        const actual = minusOneDay(stringDateDisguisedAsDate);
        expect(actual).toEqual(expected);
    });
});

function parseJsonDates(dateString1: string | null, dateString2?: string | null): DateObject[] {
    const json = `{"date1": ${getJsonString(dateString1)}, "date2": ${getJsonString(dateString2)}}`;
    const dates = JSON.parse(json) as DateObject;
    return [dates];
}

function getJsonString(value: string | undefined | null): string | null {
    if (!value) return null;
    return `"${value}"`;
}

interface DateObject {
    date1?: Date;
    date2?: Date;
}
