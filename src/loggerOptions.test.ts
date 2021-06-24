import { isLogEnabled, LogType } from './loggerOptions';

describe('loggerOptions', () => {
    it('should return true if estimated count is 0', async () => {
        const actual = isLogEnabled('TopLevelOption', LogType.Warn);
        expect(actual).toBe(true);
    });

    test.each([
        ['TopLevelOption', LogType.Disabled, false],
        ['TopLevelOption', LogType.Error, true],
        ['TopLevelOption', LogType.Warn, true],
        ['TopLevelOption', LogType.Info, false],
        ['TopLevelOption', LogType.Debug, false],
        ['TopLevelOption', LogType.Trace, false]
    ])('.TopLevelOption(%s, %s)', (a, b, expected) => {
        expect(isLogEnabled(a, b)).toBe(expected);
    });
});
