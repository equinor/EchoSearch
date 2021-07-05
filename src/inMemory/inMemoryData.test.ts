import { InMemoryData } from './inMemoryData';

describe('inMemoryData', () => {
    it('should INIT and SORT initial data', () => {
        const db = createDb();

        const input = [
            create('2'),
            create('1'),
            create('3'),
            create('8'),
            create('7'),
            create('0'),
            create('9'),
            create('5'),
            create('4'),
            create('6')
        ];
        db.clearAndInit(input);
        const actual = db.all();

        const expected = [
            create('0'),
            create('1'),
            create('2'),
            create('3'),
            create('4'),
            create('5'),
            create('6'),
            create('7'),
            create('8'),
            create('9')
        ];
        expect(actual).toEqual(expected);
    });

    it('should CLEAR old data and INIT new data', () => {
        const db = createDb();

        const input = [create('2'), create('1'), create('3')];
        db.clearAndInit(input);
        const actual = db.all();
        const expected = [create('1'), create('2'), create('3')];
        expect(actual).toEqual(expected);

        const input2 = [create('6'), create('5')];
        db.clearAndInit(input2);
        const actual2 = db.all();
        const expected2 = [create('5'), create('6')];
        expect(actual2).toEqual(expected2);
    });

    it('should CLEAR all data', () => {
        const db = createDb();

        const input = [create('2'), create('1'), create('3')];
        db.clearAndInit(input);
        const actual = db.all();
        const expected = [create('1'), create('2'), create('3')];
        expect(actual).toEqual(expected);

        db.clearData();
        const actual2 = db.all();
        expect(actual2).toEqual([]);
    });

    it('length should equal count of all items', () => {
        const db = createDb();

        const input = [create('2'), create('1'), create('3')];
        db.clearAndInit(input);
        const actual = db.length();
        expect(actual).toEqual(3);
    });

    it('should UPDATE existing items and ADD new items on update', () => {
        const db = createDb();

        db.clearAndInit([create('2'), create('1'), create('3')]);
        const actual = db.all();
        const expected = [create('1'), create('2'), create('3')];
        expect(actual).toEqual(expected);

        db.updateItems([create('1', 'a name'), create('9'), create('8')]);
        const actual2 = db.all();
        const expected2 = [create('1', 'a name'), create('2'), create('3'), create('8'), create('9')];
        expect(actual2).toEqual(expected2);

        expect(db.length()).toEqual(5);
    });

    it('should REMOVE specific items', () => {
        const db = createDb();

        const input = [create('2'), create('1'), create('3'), create('5'), create('4'), create('6')];
        db.clearAndInit(input);

        db.removeItems([create('1'), create('2'), create('3'), create('6')]);
        expect(db.all()).toEqual([create('4'), create('5')]);
    });
});

function createDb(): InMemoryData<DummyData> {
    const data = new InMemoryData<DummyData>((i) => i.id);
    return data;
}

function create(id: string, inputName?: string): DummyData {
    return { id, name: inputName !== undefined ? inputName : id };
}

interface DummyData {
    id: string;
    name: string;
}
