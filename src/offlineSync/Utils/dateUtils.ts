/**
 * Returns the max date in the collection if it exists, otherwise it returns undefined
 * @param collection The collection to search through
 * @param getDatesFunc Function for getting the dates for the specific item T in Collection<T>
 */
export function getMaxDateFunc<T>(
    collection: ReadonlyArray<T>,
    getDatesFunc: (arg: T) => (Date | undefined)[]
): Date | undefined {
    let maxDate: Date | undefined = undefined;
    collection.forEach((item) => {
        const itemDates = getDatesFunc(item);
        const itemDate = getMaxDateInCollection(itemDates);
        maxDate = getMaxDate(maxDate, itemDate);
    });

    return maxDate ? new Date(maxDate) : undefined;
}

export function getMaxDateInCollection(collection: ReadonlyArray<Date | undefined>): Date | undefined {
    let maxDate: Date | undefined = undefined;
    collection.forEach((itemDate) => {
        maxDate = getMaxDate(maxDate, itemDate);
    });

    return maxDate ? new Date(maxDate) : undefined;
}

export function getMaxDate(maxDate?: Date, itemDate?: Date): Date | undefined {
    return !maxDate || (itemDate && itemDate > maxDate) ? itemDate : maxDate;
}

export function minusOneDay(date?: Date): Date | undefined {
    if (!date) return undefined;
    if (typeof date === 'string') date = new Date(date);
    date.setDate(date.getDate() - 1);
    return date;
}
