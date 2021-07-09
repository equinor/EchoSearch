export enum LogType {
    Disabled = 0,
    Trace,
    Debug,
    Info,
    Performance,
    Warn,
    Error
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
