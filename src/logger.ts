/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotImplementedError } from './baseResult';
import { ElapsedTimeInSeconds } from './offlineSync/Utils/timeUtils';

export interface LogOptions {
    minLevels: { [module: string]: string };
}

const options: LogOptions = {
    minLevels: {
        '': 'warn',
        '[Search.EXternal': 'Trace'
    }
};

function toEnumCase(enumValue: string): string {
    return enumValue.charAt(0).toUpperCase() + enumValue.substr(1).toLowerCase();
}

function isLogEnabled(context: string, logType: LogType): boolean {
    let minLevel = LogType.Disabled.toString();
    let match = '';

    for (const optionContext in options.minLevels) {
        if (context.toLowerCase().startsWith(optionContext.toLowerCase()) && optionContext.length >= match.length) {
            minLevel = options.minLevels[optionContext];
            match = optionContext;
        }
    }

    const logLevelFromConfig: LogType = LogType[toEnumCase(minLevel)];
    //console.log('match', match, minLevel, logLevelFromConfig, logLevelFromConfig <= logType);
    return logLevelFromConfig <= logType;
}

function logWithType(logType: LogType, context: string, ...args: any[]): void {
    if (!isLogEnabled(context, logType)) return;

    if (logType === LogType.Trace) console.log(context, ...args);
    else if (logType === LogType.Debug) console.log(context, ...args);
    else if (logType === LogType.Info) console.log(context, ...args);
    else if (logType === LogType.Warn) console.warn(context, ...args);
    else if (logType === LogType.Error) console.error(context, ...args);
    else throw new NotImplementedError(`${logType} logging has not been implemented`);
}

enum LogType {
    Trace = 1,
    Debug,
    Info,
    Warn,
    Error,
    Disabled
}

function logPerformanceToConsole(message: string, startTime: number, forcePrintToConsole = false): void {
    const timeInSeconds = ElapsedTimeInSeconds(startTime);
    if (!forcePrintToConsole && timeInSeconds < 0.8) return;

    let color = 'green';
    if (timeInSeconds > 0.3) color = 'orange';
    if (timeInSeconds > 1) color = 'red';

    console.log('%c%s %c%s', `color: black;`, message, `color: ${color};`, timeInSeconds.toFixed(3) + ' sec(s)');
}

export function logPerformanceFunc(message: string, func: () => void): void {
    const tStart = performance.now();
    func();
    logPerformanceToConsole(message, tStart);
}

export interface PerformanceFunctions {
    log: (message: string) => void;
    logDelta: (message: string) => void;
    forceLog: (message: string) => void;
    forceLogDelta: (message: string) => void;
}

export function logPerformance(preText?: string): PerformanceFunctions {
    const tStart = performance.now();
    let tDelta = tStart;
    const preTextMessage = preText ? preText : '';

    function internalLogPerformanceToConsole(message: string, startTime: number, forceLog: boolean): void {
        const text = preTextMessage.trim() + ' ' + message;
        logPerformanceToConsole(text.trim(), startTime, forceLog);
        tDelta = performance.now();
    }

    return {
        log: (message) => internalLogPerformanceToConsole(message, tStart, false),
        logDelta: (message) => internalLogPerformanceToConsole(message, tDelta, false),
        forceLog: (message) => internalLogPerformanceToConsole(message, tStart, true),
        forceLogDelta: (message) => internalLogPerformanceToConsole(message, tDelta, true)
    };
}

export interface LoggerFunctions {
    trace: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;

    create: (childContext: string) => LoggerFunctions;
    performance: (preText?: string) => PerformanceFunctions;
}

/**
 * Creates a logger with the specific context, eg: [SearchModule]. Use create
 * to create a new logger with nested child context, eg: [SearchModule.Sync]
 *
 * Example:
 * ```typescript
 * const logger = createLogger('SearchModule');
 * logger.Info('This is a log message'); // => [SearchModule] This is a log message
 * const syncLogger = logger.create('Sync');
 * syncLogger.Info('Done'); // => [SearchModule.Sync] Done
 * // Performance
 * performanceLogger = logger.performance('Tag Search');
 * searchTags();
 * performanceLogger.log('Done'); // => [SearchModule] Tag Search Done 0.106 sec(s)
 * ```
 * @param context The context/scope of the logger
 * @returns Functions for logging or monitor performance.
 */
export function createLogger(context: string): LoggerFunctions {
    function getContext(): string {
        return `[${context.trim()}]`;
    }

    return {
        trace: (...args: any[]) => logWithType(LogType.Trace, getContext(), ...args),
        debug: (...args: any[]) => logWithType(LogType.Debug, getContext(), ...args),
        info: (...args: any[]) => logWithType(LogType.Info, getContext(), ...args),
        warn: (...args: any[]) => logWithType(LogType.Warn, getContext(), ...args),
        error: (...args: any[]) => logWithType(LogType.Error, getContext(), ...args),
        create: (childContext: string) => createLogger(`${context}.${childContext}`),
        performance: (preText?: string) => logPerformance(`${getContext()} ${preText ?? ''}`.trim())
    };
}

export function logger(context: string): LoggerFunctions {
    return createLogger('Search.' + context);
}
