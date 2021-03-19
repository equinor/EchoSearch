export function extractPositiveNumbers(values: string[]): number[] {
    return values
        .map((item) => parseInt(item.replace(/^\D+/g, '')))
        .filter((i) => i > 0 && (!isFinite(i) || !isNaN(i)));
}

export function getMaxNumberInCollection(databaseNames: string[]): number {
    const versions = extractPositiveNumbers(databaseNames);
    const currentVersion = Math.max(1, ...versions);
    return currentVersion;
}

export function orEmpty(value: string): string {
    return value || '';
}
