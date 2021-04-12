import { verifyCount } from './dataVerification';

describe('dataVerification - verifyCount', () => {
    it('should return true if estimated count is 0', async () => {
        const actual = await verifyCount(10, () => Promise.resolve(0));
        expect(actual).toBe(true);
    });

    it('should return false if actual count is lower than estimated count with tolerance', async () => {
        const actual = await verifyCount(8, () => Promise.resolve(10), undefined, 0.9);
        expect(actual).toBe(false);
    });
    it('should return true if actual count is equal to estimated count with tolerance', async () => {
        const actual = await verifyCount(5, () => Promise.resolve(10), undefined, 0.5);
        expect(actual).toBe(true);
    });
    it('should return true if actual count is higher than estimated count with tolerance', async () => {
        const actual = await verifyCount(11, () => Promise.resolve(10), undefined, 1.0);
        expect(actual).toBe(true);
    });
});
