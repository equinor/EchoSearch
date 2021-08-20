import { isLogEnabled, logging, LogLevel, LogOptions } from './loggerOptions';

describe('loggerOptions default', () => {
    it('Default log level should be set to Warn', () => {
        expect(logging.getDefaultLogLevel()).toBe(LogLevel.Warn);
    });
});

describe('loggerOptions', () => {
    beforeEach(() => {
        const logOptions: LogOptions = {
            Search: LogLevel.Info,
            '': LogLevel.Warn,
            'Search.External': LogLevel.Disabled,
            'Search.External.Module2': LogLevel.Critical
        };
        logging.setLogLevels(logOptions);
    });

    it('Default log level should be set to warn', () => {
        expect(logging.getDefaultLogLevel()).toBe(LogLevel.Warn);
    });

    it('getLogLevel for [Search] should be LogLevel.info', () => {
        expect(logging.getLogLevel('SEARCH')).toBe(LogLevel.Info);
    });

    it('setLogLevel should overwrite existing logLevel for [Search]', () => {
        const context = 'search';
        expect(logging.getLogLevel(context)).toBe(LogLevel.Info);
        logging.setLogLevel(context, LogLevel.Debug);
        expect(logging.getLogLevel(context)).toBe(LogLevel.Debug);
    });

    it('setDefaultLogLevel should overwrite existing default logLevel', () => {
        expect(logging.getDefaultLogLevel()).toBe(LogLevel.Warn);
        logging.setDefaultLogLevel(LogLevel.Debug);
        expect(logging.getDefaultLogLevel()).toBe(LogLevel.Debug);
    });

    it('loggerOptions should be Case and Bracket Insensitive', () => {
        const actual2 = isLogEnabled('[SeARch]', LogLevel.Info);
        expect(actual2).toBe(true);

        const actual = isLogEnabled('SeARch', LogLevel.Info);
        expect(actual).toBe(true);
    });

    const nonExistingContext = 'nonExistingContext';
    test.each([
        [nonExistingContext, LogLevel.Critical, true],
        [nonExistingContext, LogLevel.Error, true],
        [nonExistingContext, LogLevel.Warn, true],
        [nonExistingContext, LogLevel.Performance, false],
        [nonExistingContext, LogLevel.Info, false],
        [nonExistingContext, LogLevel.Debug, false],
        [nonExistingContext, LogLevel.Trace, false],
        [nonExistingContext, LogLevel.Disabled, false]
    ])('nonExistingContext should be set to default warn: %s, %s expected %s', (a, b, expected) => {
        expect(isLogEnabled(a, b)).toBe(expected);
    });

    const searchContext = '[Search]';
    test.each([
        [searchContext, LogLevel.Critical, true],
        [searchContext, LogLevel.Error, true],
        [searchContext, LogLevel.Warn, true],
        [searchContext, LogLevel.Performance, true],
        [searchContext, LogLevel.Info, true],
        [searchContext, LogLevel.Debug, false],
        [searchContext, LogLevel.Trace, false],
        [searchContext, LogLevel.Disabled, false]
    ])('isLogEnabled: [Search] should be set to Info: (%s, %s) expected %s', (a, b, expected) => {
        expect(isLogEnabled(a, b)).toBe(expected);
    });

    const searchContextExternal = '[Search.External]';
    test.each([
        [searchContextExternal, LogLevel.Critical, false],
        [searchContextExternal, LogLevel.Error, false],
        [searchContextExternal, LogLevel.Warn, false],
        [searchContextExternal, LogLevel.Performance, false],
        [searchContextExternal, LogLevel.Info, false],
        [searchContextExternal, LogLevel.Debug, false],
        [searchContextExternal, LogLevel.Trace, false],
        [searchContextExternal, LogLevel.Disabled, false]
    ])('isLogEnabled: [Search.External] should be set to Disabled: (%s, %s) expected %s', (a, b, expected) => {
        expect(isLogEnabled(a, b)).toBe(expected);
    });

    const searchContextExternalModule2 = '[Search.External.Module2]';
    test.each([
        [searchContextExternalModule2, LogLevel.Critical, true],
        [searchContextExternalModule2, LogLevel.Error, false],
        [searchContextExternalModule2, LogLevel.Warn, false],
        [searchContextExternalModule2, LogLevel.Performance, false],
        [searchContextExternalModule2, LogLevel.Info, false],
        [searchContextExternalModule2, LogLevel.Debug, false],
        [searchContextExternalModule2, LogLevel.Trace, false],
        [searchContextExternalModule2, LogLevel.Disabled, false]
    ])('isLogEnabled: [Search.External.Module2] should be set to Critical: (%s, %s) expected %s', (a, b, expected) => {
        expect(isLogEnabled(a, b)).toBe(expected);
    });
});
