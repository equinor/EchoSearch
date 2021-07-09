import { isLogEnabled, logging, LogOptions, LogType } from './loggerOptions';

describe('loggerOptions default', () => {
    it('Default log level should be set to Error', () => {
        expect(logging.getDefaultLogLevel()).toBe(LogType.Error);
    });
});

describe('loggerOptions', () => {
    beforeEach(() => {
        const logOptions: LogOptions = {
            Search: LogType.Info,
            '': LogType.Warn,
            'Search.External': LogType.Disabled,
            'Search.External.Module2': LogType.Error
        };
        logging.setLogLevels(logOptions);
    });

    it('Default log level should be set to warn', () => {
        expect(logging.getDefaultLogLevel()).toBe(LogType.Warn);
    });

    it('getLogLevel for [Search] should be LogType.info', () => {
        expect(logging.getLogLevel('SEARCH')).toBe(LogType.Info);
    });

    it('setLogLevel should overwrite existing logLevel for [Search]', () => {
        const context = 'search';
        expect(logging.getLogLevel(context)).toBe(LogType.Info);
        logging.setLogLevel(context, LogType.Debug);
        expect(logging.getLogLevel(context)).toBe(LogType.Debug);
    });

    it('setDefaultLogLevel should overwrite existing default logLevel', () => {
        expect(logging.getDefaultLogLevel()).toBe(LogType.Warn);
        logging.setDefaultLogLevel(LogType.Debug);
        expect(logging.getDefaultLogLevel()).toBe(LogType.Debug);
    });

    it('loggerOptions should be Case and Bracket Insensitive', () => {
        const actual2 = isLogEnabled('[SeARch]', LogType.Info);
        expect(actual2).toBe(true);

        const actual = isLogEnabled('SeARch', LogType.Info);
        expect(actual).toBe(true);
    });

    const nonExistingContext = 'nonExistingContext';
    test.each([
        [nonExistingContext, LogType.Error, true],
        [nonExistingContext, LogType.Warn, true],
        [nonExistingContext, LogType.Performance, false],
        [nonExistingContext, LogType.Info, false],
        [nonExistingContext, LogType.Debug, false],
        [nonExistingContext, LogType.Trace, false],
        [nonExistingContext, LogType.Disabled, false]
    ])('nonExistingContext should be set to default warn: %s, %s expected %s', (a, b, expected) => {
        expect(isLogEnabled(a, b)).toBe(expected);
    });

    const searchContext = '[Search]';
    test.each([
        [searchContext, LogType.Error, true],
        [searchContext, LogType.Warn, true],
        [searchContext, LogType.Performance, true],
        [searchContext, LogType.Info, true],
        [searchContext, LogType.Debug, false],
        [searchContext, LogType.Trace, false],
        [searchContext, LogType.Disabled, false]
    ])('isLogEnabled: [Search] should be set to Info: (%s, %s) expected %s', (a, b, expected) => {
        expect(isLogEnabled(a, b)).toBe(expected);
    });

    const searchContextExternal = '[Search.External]';
    test.each([
        [searchContextExternal, LogType.Error, false],
        [searchContextExternal, LogType.Warn, false],
        [searchContextExternal, LogType.Performance, false],
        [searchContextExternal, LogType.Info, false],
        [searchContextExternal, LogType.Debug, false],
        [searchContextExternal, LogType.Trace, false],
        [searchContextExternal, LogType.Disabled, false]
    ])('isLogEnabled: [Search.External] should be set to Disabled: (%s, %s) expected %s', (a, b, expected) => {
        expect(isLogEnabled(a, b)).toBe(expected);
    });

    const searchContextExternalModule2 = '[Search.External.Module2]';
    test.each([
        [searchContextExternalModule2, LogType.Error, true],
        [searchContextExternalModule2, LogType.Warn, false],
        [searchContextExternalModule2, LogType.Performance, false],
        [searchContextExternalModule2, LogType.Info, false],
        [searchContextExternalModule2, LogType.Debug, false],
        [searchContextExternalModule2, LogType.Trace, false],
        [searchContextExternalModule2, LogType.Disabled, false]
    ])('isLogEnabled: [Search.External.Module2] should be set to Error: (%s, %s) expected %s', (a, b, expected) => {
        expect(isLogEnabled(a, b)).toBe(expected);
    });
});
