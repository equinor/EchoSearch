export function distinct<T, Key>(values: ReadonlyArray<T>, getKeyValue: (keyValue: T) => Key): T[] {
    return values.filter(
        (item, i, arr) =>
            arr.indexOf(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                arr.find((arrayItem) => getKeyValue(arrayItem) === getKeyValue(item))!
            ) === i
    );
}
