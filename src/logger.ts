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

export function postNotificationPerformance(
    message: string,
    startTime: number,
    forcePrintToConsole: boolean = false
): void {
    logPerformanceToConsole(message, startTime, forcePrintToConsole);
}

function logPerformanceToConsole(message: string, startTime: number, forcePrintToConsole: boolean = false): void {
    const timeInSeconds = ElapsedTimeInSeconds(startTime);
    if (!forcePrintToConsole && timeInSeconds < 0.8) return;

    let color = 'green';
    if (timeInSeconds > 0.3) color = 'orange';
    if (timeInSeconds > 1) color = 'red';

    console.log('%c%s %c%s', `color: black;`, message, `color: ${color};`, timeInSeconds.toFixed(3) + ' sec(s)');
}

//TODO Ove - proper error handling
export function handleErrors(e: any) {
    console.error(e);
}

export function logPerformanceFunc(message: string, func: () => void): void {
    const tStart = performance.now();
    func();
    logPerformanceToConsole(message, tStart);
}

export interface LogPerformance {
    log: (message: string) => void;
    logDelta: (message: string) => void;
    forceLog: (message: string) => void;
    forceLogDelta: (message: string) => void;
}

export function logPerformance(preText?: string): LogPerformance {
    const tStart = performance.now();
    let tDelta = tStart;
    let preTextMessage = preText ? preText : '';

    function internalLogPerformanceToConsole(message: string, startTime: number, forceLog: boolean): void {
        var text = preTextMessage + message;
        logPerformanceToConsole(text, startTime, forceLog);
        tDelta = performance.now();
    }

    return {
        log: (message) => internalLogPerformanceToConsole(message, tStart, false),
        logDelta: (message) => internalLogPerformanceToConsole(message, tDelta, false),
        forceLog: (message) => logPerformanceToConsole(message, tStart, true),
        forceLogDelta: (message) => internalLogPerformanceToConsole(message, tDelta, true)
    };
}
