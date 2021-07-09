/**
 * Log levels, from least to most important. Log if level is equal or higher than the specified log level for current context.
 * @link https://docs.microsoft.com/en-us/dotnet/api/microsoft.extensions.logging.loglevel?view=dotnet-plat-ext-5.0
 */
export enum LogType {
    /**
     * Not used for writing log messages. Specifies that a logging category should not write any messages.
     */
    Disabled = 0,

    /**
     * Logs that contain the most detailed messages. These messages may contain sensitive application data. These messages are disabled by default and should never be enabled in a production environment.
     */
    Trace,

    /**
     * Logs that are used for interactive investigation during development. These logs should primarily contain information useful for debugging and have no long-term value.
     */
    Debug,

    /**
     * Logs that track the general flow of the application. These logs should have long-term value.
     */
    Info,

    Performance,

    /**
     * Logs that highlight an abnormal or unexpected event in the application flow, but do not otherwise cause the application execution to stop.
     */
    Warn,

    /**
     * Logs that highlight when the current flow of execution is stopped due to a failure. These should indicate a failure in the current activity, not an application-wide failure.
     */
    Error,

    /**
     *  Logs that describe an unrecoverable application or system crash, or a catastrophic failure that requires immediate attention.
     */
    Critical
}

const logOptions: LogOptions = { '': LogType.Error }; //Default

function formatContext(context: string) {
    const stripChars = '[]';
    context = strip(context, stripChars).toLowerCase();
    return context;
}

function setLogLevel(context: string, logTypeLevel: LogType): void {
    logOptions[formatContext(context)] = logTypeLevel;
}

function getLogLevel(context: string): LogType {
    return logOptions[formatContext(context)] ?? getDefaultLogLevel();
}

function setLogLevels(logLevels: LogOptions): void {
    for (const logLevel of Object.keys(logLevels)) {
        setLogLevel(logLevel, logLevels[logLevel]);
    }
}

function setDefaultLogLevel(defaultLogLevel: LogType): void {
    setLogLevel('', defaultLogLevel);
}

function getDefaultLogLevel(): LogType {
    return logOptions[''] ?? LogType.Disabled;
}

function strip(value: string, charsToStrip: string, replaceWithChar = ''): string {
    for (const char of charsToStrip) {
        value = value.replace(char, replaceWithChar);
    }
    return value;
}

export const logging = {
    setLogLevel,
    setLogLevels,
    setDefaultLogLevel,
    getDefaultLogLevel,
    getLogLevel
};

export interface LogOptions {
    [context: string]: LogType;
}

export function isLogEnabled(context: string, logType: LogType): boolean {
    if (logType === LogType.Disabled) return false;
    context = formatContext(context);
    let minLevel = getDefaultLogLevel();

    let match = '';
    for (const optionContext in logOptions) {
        if (optionContext.length > 0 && optionContext.length >= match.length && context.startsWith(optionContext)) {
            minLevel = logOptions[optionContext];
            match = optionContext;
        }
    }

    if (minLevel === LogType.Disabled) return false;

    return logType >= minLevel;
}
