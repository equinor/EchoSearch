import { distinct } from './distinct';

describe('distinct', () => {
    it('should handle primitive types like numbers', () => {
        const inputValues = [5, 1, 1, 2, 2, 3, 3, 5, 5];
        const actual = distinct(inputValues, (key) => key);
        expect(actual).toStrictEqual([5, 1, 2, 3]);
    });

    it('should handle objects and make unique by key (name)', () => {
        const values = [
            { name: 'name1', prop1: '1' },
            { name: 'name1', prop1: '2' },
            { name: 'name2', prop1: '1' },
            { name: 'name2', prop1: '1' },
            { name: 'name3', prop1: '1' },
            { name: 'name1', prop1: '3' }
        ];
        const actual = distinct(values, (key) => key.name);

        const expected = [
            { name: 'name1', prop1: '1' },
            { name: 'name2', prop1: '1' },
            { name: 'name3', prop1: '1' }
        ];

        expect(actual).toStrictEqual(expected);
    });
});
