export function queryParameter(
    parameterName: string,
    parameterValue?: string | number,
    queryParameterSeparator = '&'
): string {
    return parameterValue ? `${queryParameterSeparator}${parameterName}=${encodeURIComponent(parameterValue)}` : '';
}
