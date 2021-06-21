/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElapsedTimeInSeconds } from './offlineSync/Utils/timeUtils';

function logWithType(logType: LogType, ...args: any[]): void {
    if (logType === LogType.Info) console.log(...args);
    else if (logType === LogType.Warn) console.warn(...args);
    else if (logType === LogType.Error) console.error(...args);
    else if (logType === LogType.Trace) console.log(...args);
}

/*
    private readonly levels: { [key: string]: number } = {
        trace: 1,
        debug: 2,
        info: 3,
        warn: 4,
        error: 5
    };
    
    private levelToInt(minLevel: string): number {
        if (minLevel.toLowerCase() in this.levels) return this.levels[minLevel.toLowerCase()];
        else return 99;
    }    
*/

enum LogType {
    Trace,
    Debug,
    Info,
    Warn,
    Error
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
        // performance: (childContext?: string) =>
        //     childContext
        //         ? createLogger(`${context}.${childContext}`).performance(format(''))
        //         : logPerformance(format(''))
    };
}

export function logger(context: string): LoggerFunctions {
    return createLogger('Search.' + context);
}
