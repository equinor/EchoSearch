import { InMemoryData } from './inMemoryData';

describe('inMemoryData', () => {
    it('should init and sort initial data', () => {
        const db = createDb();

        var input = [create('2'), create('1'), create('3')];
        db.clearAndInit(input);
        const actual = db.all();

        var expected = [create('1'), create('2'), create('3')];
        expect(actual).toEqual(expected);
    });

    it('should clear old data and init new data', () => {
        const db = createDb();

        var input = [create('2'), create('1'), create('3')];
        db.clearAndInit(input);
        const actual = db.all();
        var expected = [create('1'), create('2'), create('3')];
        expect(actual).toEqual(expected);

        var input2 = [create('6'), create('5')];
        db.clearAndInit(input2);
        const actual2 = db.all();
        var expected2 = [create('5'), create('6')];
        expect(actual2).toEqual(expected2);
    });

    it('should clear all data', () => {
        const db = createDb();

        var input = [create('2'), create('1'), create('3')];
        db.clearAndInit(input);
        const actual = db.all();
        var expected = [create('1'), create('2'), create('3')];
        expect(actual).toEqual(expected);

        db.clearData();
        const actual2 = db.all();
        expect(actual2).toEqual([]);
    });

    it('length should equal count of all items', () => {
        const db = createDb();

        var input = [create('2'), create('1'), create('3')];
        db.clearAndInit(input);
        const actual = db.length();
        expect(actual).toEqual(3);
    });

    it('should update existing data and add new data on update', () => {
        const db = createDb();

        db.clearAndInit([create('2'), create('1'), create('3')]);
        const actual = db.all();
        var expected = [create('1'), create('2'), create('3')];
        expect(actual).toEqual(expected);

        db.updateData([create('1', 'a name'), create('9'), create('8')]);
        const actual2 = db.all();
        var expected2 = [create('1', 'a name'), create('2'), create('3'), create('8'), create('9')];
        expect(actual2).toEqual(expected2);

        expect(db.length()).toEqual(5);
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
