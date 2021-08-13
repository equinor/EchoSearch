import { ArgumentDateError } from '../../results/baseResult';

export function randomId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function randomNumberId(length: number): number {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return Number.parseInt(result);
}

/**
 * Return date as a api friendly formatted string
 * @param date The specified date to format
 * @throws ArgumentDateError if invalid date
 * @returnsReturns date formatted as: 2021-01-19T07:26:51.000Z
 */
export function dateAsApiString(date: Date | string): string {
    const dateString = dateAsApiStringOrUndefined(date);
    if (!dateString) {
        throw new ArgumentDateError('dateAsApiString - date is undefined');
    }
    return dateString;
}

export function dateAsApiStringOrUndefined(date: Date | string | undefined): string | undefined {
    if (!date) {
        return undefined;
    }

    date = typeof date === 'string' ? new Date(date) : date;

    const dateFormatEnGb = 'en-GB';
    const dateString = date.toLocaleDateString(dateFormatEnGb);
    if (dateString.toLowerCase().includes('invalid date')) {
        throw new ArgumentDateError('dateAsApiString - date is invalid date');
    }

    return toLocalIsoString(date); //toIsoString converts it to UTC, and we don't want that, we want to keep the time from the server timestamp.
}

function toLocalIsoString(date: Date): string {
    function pad(number: number) {
        let r = String(number);
        if (r.length === 1) {
            r = '0' + r;
        }
        return r;
    }

    return (
        date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate()) +
        'T' +
        pad(date.getHours()) +
        ':' +
        pad(date.getMinutes()) +
        ':' +
        pad(date.getSeconds()) +
        '.' +
        String((date.getMilliseconds() / 1000).toFixed(3)).slice(2, 5) +
        'Z'
    );
}
