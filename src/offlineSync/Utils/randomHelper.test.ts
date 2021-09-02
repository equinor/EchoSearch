import { randomFrom } from './randomHelper';

describe('randomFrom [0, 1 ]', () => {
    it('should be 0 or 1', () => {
        for (let index = 0; index < 10; index++) {
            const actual = randomFrom([0, 1]);
            expect(actual).toBeGreaterThanOrEqual(0);
            expect(actual).toBeLessThanOrEqual(1);
        }
    });
});
