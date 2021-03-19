import { LevTrie, TrieResult } from './levTrie';

const insertCost = 5;
const replaceCost = 5;
const deleteCost = 5;

describe('LevTrie Insert Cost', () => {
    const levTrie: LevTrie = new LevTrie();
    levTrie.addWord('ABCDEFGH');

    it('Insert first letter', () => {
        const actual = levTrie.closest('BCDEFGH', 100, true);
        expect(actual?.cost).toEqual(insertCost);
    });

    it('Insert 3 first letters', () => {
        const actual = levTrie.closest('DEFGH', 100, true);
        expect(actual?.cost).toEqual(insertCost * 3);
    });

    it('Insert 2 last letters', () => {
        const actual = levTrie.closest('ABCDEF', 100, true);
        expect(actual?.cost).toEqual(insertCost * 2);
    });
    it('Insert 2 middle letters', () => {
        const actual = levTrie.closest('ABCFGH', 100, true);
        expect(actual?.cost).toEqual(insertCost * 2);
    });
});

describe('LevTrie Replace Cost', () => {
    const levTrie: LevTrie = new LevTrie();
    levTrie.addWord('ABCDEFGH');

    it('Replace first letter', () => {
        const actual = levTrie.closest('-BCDEFGH', 100, true);
        expect(actual?.cost).toEqual(replaceCost);
    });

    it('Replace 3 first letters', () => {
        const actual = levTrie.closest('---DEFGH', 100, true);
        expect(actual?.cost).toEqual(replaceCost * 3);
    });

    it('Replace 2 last letters', () => {
        const actual = levTrie.closest('ABCDEF--', 100, true);
        expect(actual?.cost).toEqual(replaceCost * 2);
    });
    it('Replace 2 middle letters', () => {
        const actual = levTrie.closest('ABC--FGH', 100, true);
        expect(actual?.cost).toEqual(replaceCost * 2);
    });
});

describe('LevTrie Delete Cost', () => {
    const levTrie: LevTrie = new LevTrie();
    levTrie.addWord('ABCDEFGH');

    it('Delete first letter', () => {
        const actual = levTrie.closest('+ABCDEFGH', 100, true);
        expect(actual?.cost).toEqual(deleteCost);
    });

    it('Delete 3 first letters', () => {
        const actual = levTrie.closest('+++ABCDEFGH', 100, true);
        expect(actual?.cost).toEqual(deleteCost * 3);
    });

    it('Delete 2 last letters', () => {
        const actual = levTrie.closest('ABCD+E+FGH', 100, true);
        expect(actual?.cost).toEqual(deleteCost * 2);
    });
    it('Delete 2 middle letters', () => {
        const actual = levTrie.closest('ABCDEFGH++', 100, true);
        expect(actual?.cost).toEqual(deleteCost * 2);
    });
});

describe('LevTrie Substitute Cost', () => {
    const levTrie: LevTrie = new LevTrie();
    levTrie.addWord('01234567');
    it('Substitute 0 O', () => {
        const actual = levTrie.closest('O1234567', 100, true);
        expect(actual?.cost).toEqual(1);
    });
    it('Substitute G 6', () => {
        const actual = levTrie.closest('012345G7', 100, true);
        expect(actual?.cost).toEqual(2);
    });
});

describe('LevTrie MAX Cost', () => {
    const levTrie: LevTrie = new LevTrie();
    levTrie.addWord('01234567');
    it('Substitute 0 O', () => {
        const actual = levTrie.closest('O-234567', 6);
        expect(actual?.cost).toEqual(6);
    });
    it('Substitute 0 O', () => {
        const actual = levTrie.closest('OI-34567', 6); //cost will be 7, but 6 is max => undefined
        expect(actual?.cost).toEqual(undefined);
    });
});

describe('LevTrie Find Closest in Collection', () => {
    const levTrie: LevTrie = new LevTrie();
    levTrie.addWord('A-73MA001');
    levTrie.addWord('A-73MA002');
    levTrie.addWord('A-73MA003');
    levTrie.addWord('D-93ES0045A');
    levTrie.addWord('R-70JC002');
    levTrie.addWord('R-70JF002');
    levTrie.addWord('L77D9300');

    it('Should find exact match with cost of 0', () => {
        const actual = levTrie.closest('A-73MA003', 6);
        expect(actual).toEqual(getExpected('A-73MA003', 0));
    });

    it('Substitute 0 with O, it should find closest match with cost', () => {
        const actual = levTrie.closest('A-73MA0O2', 6);
        expect(actual).toEqual(getExpected('A-73MA002', 1));
    });

    it('Insert 3 should find closest TAG', () => {
        const actual = levTrie.closest('D9300', 100, true);
        expect(actual).toEqual(getExpected('L77D9300', 15));
    });

    it('Insert 3 should not find closest match because of max cost', () => {
        const actual = levTrie.closest('D9300', 6);
        expect(actual).toEqual(undefined);
    });

    it('Search for R-70JFO02 should find R-70JF002 and not R-70JC002 (appInsight example)', () => {
        const actual = levTrie.closest('R-70JFO02', 6);
        expect(actual).toEqual(getExpected('R-70JF002', 1));
    });
});

function getExpected(expected: string, cost: number): TrieResult {
    return { word: expected, cost: cost } as TrieResult;
}
