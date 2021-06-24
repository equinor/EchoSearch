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

export function isLogEnabled(context: string, logType: LogType): boolean {
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

export enum LogType {
    Trace = 1,
    Debug,
    Info,
    Warn,
    Error,
    Disabled
}
