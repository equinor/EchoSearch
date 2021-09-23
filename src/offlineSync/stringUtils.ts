import { ArgumentDateError, ArgumentError } from '../results/errors';

export function extractPositiveFirstNumbers(values: string[]): number[] {
    return values
        .map((item) => parseInt(item.replace(/^\D+/g, '')))
        .filter((i) => i > 0 && (!isFinite(i) || !isNaN(i)));
}

export function getMaxNumberInCollectionOrOne(databaseNames: string[]): number {
    const versions = extractPositiveFirstNumbers(databaseNames);
    return Math.max(1, ...versions);
}

export function orEmpty(value?: string): string {
    return value || '';
}

export function orThrow<T>(value?: T): T {
    if (typeof value === 'number') {
        const num = value as number;
        if (Number.isNaN(num) || !Number.isFinite(num)) {
            throw new ArgumentError("Argument can't be null/undefined");
        }
        return value;
    }

    if (!value) {
        throw new ArgumentError("Argument can't be null/undefined");
    }
    return value;
}

export function toNumber(value?: string | number): number {
    if (!value) return NaN;
    return parseFloat(value.toString());
}

export function toDateOrUndefined(date?: string | Date): Date | undefined {
    const resultDate = date ? new Date(date) : undefined;
    if (resultDate && isNaN(resultDate.valueOf())) {
        return undefined;
    }
    return resultDate;
}

export function toDateOrThrowError(date?: string | Date): Date {
    const properDate = toDateOrUndefined(date);
    if (!properDate) throw new ArgumentDateError('Invalid date: ' + date);
    return properDate;
}
