//Mostly code from echo-utils

export type Filter<T> = {
    [K in keyof T]?: T[K];
};

export function filterArrayOnProps<T>(data: ReadonlyArray<T>, propsToFilterOn: Filter<T>): T[] {
    return data.filter((d) => filterOnProps(d, propsToFilterOn));
}

export function filterOnProps<T>(data: T, propsToFilterOn: Filter<T>): boolean {
    if (!(typeof data === 'object' && data !== null && !Array.isArray(data))) return true;

    const filters = Object.keys(propsToFilterOn);
    for (const filter of filters) {
        if ((data as Record<string, unknown>).hasOwnProperty(filter)) {
            const filterValueFromData = (data as Record<string, unknown>)[filter];
            const filterValueFromFilter = (propsToFilterOn as Record<string, unknown>)[filter];
            const isSuccess =
                filterValueFromData instanceof Date && filterValueFromFilter instanceof Date
                    ? filterValueFromData.getTime() === filterValueFromFilter.getTime()
                    : filterValueFromData === filterValueFromFilter;
            if (!isSuccess) return false;
        }
    }
    return true;
}
