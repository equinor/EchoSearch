import { SyncError } from '../baseResult';
import { extractDate } from './Utils/dateUtils';

export function queryParameter(
    parameterName: string,
    parameterValue?: string | number,
    queryParameterSeparator = '&'
): string {
    return parameterValue ? `${queryParameterSeparator}${parameterName}=${encodeURIComponent(parameterValue)}` : '';
}

export function extractDateFromHeader(response: Response, headerName: string): Date {
    if (response && response.headers && response.headers.get(headerName)) {
        const stringWithDate = response.headers.get(headerName);
        const date = extractDate(stringWithDate);
        if (date) return date;
    }
    throw new SyncError(`header (${headerName}) doesn't exist`); //Expected from api, something is wrong with api response
}
