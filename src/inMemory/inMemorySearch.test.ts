import { EchoEnv } from '@equinor/echo-core';
import { searchIn, searchOrderedByBestMatchLogic } from './inMemorySearch';

jest.mock('@equinor/echo-core', () => {
    return {
        EchoEnv: jest.fn(() => {
            return {
                env: jest.fn(() => {
                    return {
                        GENERATE_SOURCEMAP: false,
                        REACT_APP_APPINSIGHTS_INSTRUMENTATIONKEY: '3456',
                        REACT_APP_API_CLIENT_ID: '1',
                        REACT_APP_API_URL: 'url',
                        REACT_APP_AZURE_AD_CLIENT_ID: '1',
                        REACT_APP_AZURE_AD_TENNANT: '2',
                        REACT_APP_AZURE_AD_TENNANT_ID: '3',
                        REACT_APP_AZURE_BUILD_NUMBER: '0.7',
                        REACT_APP_DEFAULT_CACHE_LOCATION: 'localStorage',
                        REACT_APP_LOGGER_ACTIVE: false
                    };
                })
            };
        })
    };
});

beforeAll(() => {
    EchoEnv.isDevelopment = jest.fn();
});

describe('searchLogic searchIn', () => {
    it('multiple search words - should return true when searchable words include all in searchText', () => {
        const expected = true;
        const tagNo = 'A73MA001';
        const description = 'this is a crane';
        const actual = searchIn([tagNo, description], '73m a crane');
        expect(actual).toEqual(expected);
    });
    it('multiple search words - should return false when searchable words does not include all in searchText', () => {
        const expected = false;
        const tagNo = 'A73MA001';
        const description = 'this is a crane';
        const actual = searchIn([tagNo, description], '73m south crane');
        expect(actual).toEqual(expected);
    });
    it('multiple search words - should handle undefined in searchable words', () => {
        const expected = true;
        const tagNo = 'A73MA001';
        const description = 'this is a crane';
        const actual = searchIn([tagNo, description, undefined], '73m a crane');
        expect(actual).toEqual(expected);
    });
});

describe('searchLogic bestMatchSearch', () => {
    it('1 search word - should prioritize text closer to start of searchable[0]', () => {
        const items = [
            create('00233333', 'C151-324'),
            create('00001C151-324', 'this is a crane'),
            create('01C151-324', 'this is a crane'),
            create('0C151-324', 'this is a crane'),
            create('C151-324', 'this is a crane'),
            create('no match', 'no match')
        ];
        const actual = searchBestMatch(items, 'C151');
        expect(actual).toEqual(items.slice(0, items.length - 1).reverse());
    });
    it('1 search word - should prioritize starts with over include for none prioritized searchables[1...end]', () => {
        const items = [
            //lower prioritized match
            create('1107-L707', 'BrineBoat Loading Station', 'L.O265C.001'),
            //Best match item:
            create('1865-L707', 'Boat2', 'L.O265C.001'),
            //none matching items:
            create('2101-L707', 'R-21L00045A, Oil  Pump(R-21PZ001A) / LO Run Down Tank(R-21TB001A)', 'L.O265C.001'),
            create('2901-L707', 'R-34L00003A, To Riser Hang Off Template G', 'L.O265C.001')
        ];
        const actual = searchBestMatch(items, 'Boat');
        expect(actual).toEqual([items[1], items[0]]);
    });

    it('multiple search words - should find single item matching all search text', () => {
        const collection = [
            create('a-73ma002', 'this is a crane', 'more searchable text'),
            create('a-73ma001', 'this is a crane', 'more searchable text')
        ];
        const actual = searchBestMatch(collection, '73m 1 a crane more');
        expect(actual.length).toEqual(1);
        expect(actual).toEqual(collection.filter((item) => item.id === 'a-73ma001'));
    });

    it('multiple search words - searchable[0] hits should be prioritized', () => {
        const items = [
            create('1107-L707', 'Brine From Boat Loading Station', 'L.O265C.001'),
            create('1865-L707', 'R-18L00009A, Tube(R-18UJ014)', 'L.O265C.001'),
            //Best match items:
            create('2101-L707', 'R-21L00045A, Oil Export Tank(R-21TB001A)', 'L.O265C.001'),
            create('2901-L707', 'R-34L00003A, To Riser Hang Off Template G', 'L.O265C.001')
        ];
        const actual = searchBestMatch(items, '01 707');
        const expected = [items[2], items[3], items[0], items[1]];
        expect(actual).toEqual(expected);
    });

    it('multiple search words - should prioritize starts with over include for none prioritized searchables[1...end]', () => {
        const items = [
            //lower prioritized match
            create('1107-L707', 'BrineBoat Loading Station', 'L.O265C.001'),
            //Best match item:
            create('1865-L707', 'Boat2', 'L.O265C.001'),
            //none matching items:
            create('2101-L707', 'R-21L00045A, R-21PZ001A) / LO Run Down Tank(R-21TB001A)', 'L.O265C.001'),
            create('2901-L707', 'R-34L00003A, To Riser Hang Off Template G', 'L.O265C.001')
        ];
        const actual = searchBestMatch(items, '001 Boat');
        expect(actual).toEqual([items[1], items[0]]);
    });

    it('multiple search words - first searchable includes 2 or more of search text', () => {
        const items = [
            create('1865-L707', 'Boat2 08 L707', 'L.O265C.001'),
            //Best match item:
            create('1108-L707', '65-L707 BrineBoat Loading Station', 'L.O265C.001'),

            //none matching items:
            create('2101-L707', 'R-21L00045A, (R-21PZ001A) / LO Run Down Tank(R-21TB001A)', 'L.O265C.001'),
            create('2901-L707', 'R-34L00003A, To Riser Hang Off Template G', 'L.O265C.001')
        ];
        const actual = searchBestMatch(items, '08 L707 Boat');
        expect(actual).toEqual([items[1], items[0]]);
    });

    it('should only return results where predicate is true', () => {
        const searchText = '1234';
        const items = [
            create(searchText, '1', 'L.O265C.001'),
            create(searchText, '2', 'L.O265C.002'),
            create('56', searchText, 'L.O265C.002'),
            create(searchText, '4, To Riser Hang Off Template G', 'L.O265C.001')
        ];
        const actual = searchBestMatch(
            items,
            searchText,
            1000,
            (item: Item): boolean => item.moreText === 'L.O265C.002'
        );
        expect(actual).toEqual([items[1], items[2]]);
    });

    it('should only return maximum number of hits', () => {
        const searchText = '1234';
        const items = [
            create(searchText, '1', 'L.O265C.001'),
            create(searchText, '2', 'L.O265C.002'),
            create('56', searchText, 'L.O265C.002'),
            create(searchText, '3', 'L.O265C.001')
        ];
        const actual = searchBestMatch(items, searchText, 2);
        expect(actual).toEqual([items[0], items[1]]);
    });
});

interface Item {
    id: string;
    description: string;
    moreText: string;
}

function searchBestMatch(
    collection: Item[],
    searchText: string,
    maxHits = 1000,
    predicate?: (arg: Item) => boolean
): Item[] {
    return searchOrderedByBestMatchLogic(
        collection,
        (arg) => [arg.id, arg.description, arg.moreText],
        searchText,
        maxHits,
        predicate
    );
}

function create(id: string, description: string, moreText = ''): Item {
    return { id: id, description: description, moreText: moreText } as Item;
}
