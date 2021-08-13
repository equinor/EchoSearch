import { SyncError } from '../results/baseResult';
import { extractDate } from './Utils/dateUtils';
import { dateAsApiString } from './Utils/stringUtils';

export interface QueryArgument {
    key: string;
    value?: string | number | boolean | Date;
}

interface ValidQueryArgument {
    key: string;
    value: string | number | boolean | Date;
}

export function queryParameter(
    parameterName: string,
    parameterValue?: string | number,
    queryParameterSeparator = '&'
): string {
    return parameterValue ? `${queryParameterSeparator}${parameterName}=${encodeURIComponent(parameterValue)}` : '';
}

export function queryParameters(args: QueryArgument[]): string {
    const result = args
        .filter((item) => notEmpty(item.value))
        .map((item) => `${item.key}=${uriEscapeString((item as ValidQueryArgument).value)}`)
        .join('&');
    return result.length > 0 ? '?' + result : result;
}

function uriEscapeString(value: string | number | boolean | Date): string | number {
    if (value instanceof Date) return dateAsApiString(value);
    return encodeURIComponent(value);
}

function notEmpty<TValue>(value?: TValue | null | undefined): value is TValue {
    if (typeof value === 'boolean') return value !== undefined || value != null;

    return !!value;
}

export function extractDateFromHeader(response: Response, headerName: string): Date {
    if (response && response.headers && response.headers.get(headerName)) {
        const stringWithDate = response.headers.get(headerName);
        const date = extractDate(stringWithDate);
        if (date) return date;
    }
    throw new SyncError(`header (${headerName}) doesn't exist`); //Expected from api, something is wrong with api response
}
