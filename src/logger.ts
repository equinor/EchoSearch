/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElapsedTimeInSeconds } from './offlineSync/Utils/timeUtils';

export function logVerbose(...args: any[]): void {
    logWithType(LogType.Verbose, ...args);
}

export function logInfo(...args: any[]): void {
    logWithType(LogType.Info, ...args);
}

export function logWarn(...args: any[]): void {
    logWithType(LogType.Warn, ...args);
}

export function logError(...args: any[]): void {
    logWithType(LogType.Error, ...args);
}

function logWithType(logType: LogType, ...args: any[]): void {
    if (logType === LogType.Info) console.log(...args);
    else if (logType === LogType.Warn) console.warn(...args);
    else if (logType === LogType.Error) console.error(...args);
    else if (logType === LogType.Verbose) console.log(...args);
}

enum LogType {
    Info,
    Warn,
    Error,
    Verbose
}

export function postNotificationPerformance(message: string, startTime: number, forcePrintToConsole = false): void {
    logPerformanceToConsole(message, startTime, forcePrintToConsole);
}

function logPerformanceToConsole(message: string, startTime: number, forcePrintToConsole = false): void {
    const timeInSeconds = ElapsedTimeInSeconds(startTime);
    if (!forcePrintToConsole && timeInSeconds < 0.8) return;

    let color = 'green';
    if (timeInSeconds > 0.3) color = 'orange';
    if (timeInSeconds > 1) color = 'red';

    console.log('%c%s %c%s', `color: black;`, message, `color: ${color};`, timeInSeconds.toFixed(3) + ' sec(s)');
}

//TODO Ove - proper error handling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleErrors(e: any): void {
    console.error(e);
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
    log: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;

    create: (childContext: string) => LoggerFunctions;
    performance: (preText?: string) => PerformanceFunctions;
}

/*
        trace: 1,
        debug: 2,
        info: 3,
        warn: 4,
        error: 5

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
        trace: (...args: any[]) => console.log(getContext(), ...args),
        debug: (...args: any[]) => console.log(getContext(), ...args),
        info: (...args: any[]) => console.log(getContext(), ...args),
        log: (...args: any[]) => console.log(getContext(), ...args),
        warn: (...args: any[]) => console.warn(getContext(), ...args),
        error: (...args: any[]) => console.error(getContext(), ...args),
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
