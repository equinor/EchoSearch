function range(size, startAt = 0) {
    return [...Array(size).keys()].map((i) => i + startAt);
}

export function randomMockedArrayString(count: number, createdMocked: () => string) {
    var tagString = randomMockedString(count, createdMocked);
    return '[' + tagString + ']';
}

export function randomMockedString(count: number, createdMocked: () => string) {
    if (count === 0) return '';
    var items = range(count);
    var itemsAsStrings = items.map((_) => createdMocked());

    var tagString = itemsAsStrings.join(',');

    return tagString;
}
