/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isLogEnabled, LogType } from './loggerOptions';
import { ElapsedTimeInSeconds } from './offlineSync/Utils/timeUtils';
import { NotImplementedError } from './results/baseResult';

const _green = '#008000';
const _cyan = '#008080';
const _gray = '#808080';

function logWithType(logType: LogType, context: string, ...args: any[]): void {
    if (!isLogEnabled(context, logType)) return;

    if (logType === LogType.Trace) logWithColor(_gray, '[Trace]', context, ...args);
    else if (logType === LogType.Debug) logWithColor(_cyan, '[Debug]', context, ...args);
    else if (logType === LogType.Info) logWithColor(_green, '[Info]', context, ...args);
    else if (logType === LogType.Warn) console.warn(context, ...args);
    else if (logType === LogType.Error) console.error(context, ...args);
    else if (logType === LogType.Critical) console.error(context, ...args);
    else throw new NotImplementedError(`${logType} logging has not been implemented`);
}

function logWithColor(color: string, ...args: any[]) {
    let firstNoneStringIndex = 0;
    for (const arg of args) {
        if (typeof arg === 'string') firstNoneStringIndex++;
        else break;
    }

    const startingStringArgs = args.slice(0, firstNoneStringIndex);
    const rest = args.slice(firstNoneStringIndex, args.length);

    logWitPartialColor(color, startingStringArgs.join(' '), ...rest);
}

function logWitPartialColor(color: string, textToApplyColorTo: string, ...args: any[]) {
    console.log('%c%s', `color: ${color};`, `${textToApplyColorTo}`, ...args);
}

function logPerformanceToConsole(
    context: string,
    message: string,
    startTime: number,
    forcePrintToConsole = false
): void {
    if (!isLogEnabled(context, LogType.Performance)) return;
    const timeInSeconds = ElapsedTimeInSeconds(startTime);
    if (!forcePrintToConsole && timeInSeconds < 0.8) return;

    let color = 'green';
    if (timeInSeconds > 0.3) color = 'orange';
    if (timeInSeconds > 1) color = 'red';

    console.log(
        '%c%s %c%s',
        `color: black;`,
        `${context} ${message}`,
        `color: ${color};`,
        timeInSeconds.toFixed(3) + ' sec(s)'
    );
}

export interface PerformanceFunctions {
    log: (message: string) => void;
    logDelta: (message: string) => void;
    forceLog: (message: string) => void;
    forceLogDelta: (message: string) => void;
}

function logPerformance(context: string, preText?: string): PerformanceFunctions {
    const tStart = performance.now();
    let tDelta = tStart;
    const preTextMessage = preText ? preText : '';

    function internalLogPerformanceToConsole(message: string, startTime: number, forceLog: boolean): void {
        const text = preTextMessage.trim() + ' ' + message;
        logPerformanceToConsole(context, text.trim(), startTime, forceLog);
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
    critical: (...args: any[]) => void;

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
        critical: (...args: any[]) => logWithType(LogType.Critical, getContext(), ...args),
        create: (childContext: string) => createLogger(`${context}.${childContext}`),
        performance: (preText?: string) => logPerformance(getContext(), `${preText ?? ''}`.trim())
    };
}

export function logger(context: string): LoggerFunctions {
    return createLogger('Search.' + context);
}

export const loggerFactory = {
    default: logger,
    tags: (context: string) => logger('Tags').create(context),
    documents: (context: string) => logger('Documents').create(context),
    commPacks: (context: string) => logger('CommPacks').create(context),
    mcPacks: (context: string) => logger('McPacks').create(context),
    checklists: (context: string) => logger('Checklists').create(context),
    punches: (context: string) => logger('Punch').create(context),
    notifications: (context: string) => logger('Notifications').create(context)
};
