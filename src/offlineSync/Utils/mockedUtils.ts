function range(size, startAt = 0) {
    return [...Array(size).keys()].map((i) => i + startAt);
}

export function randomMockedArrayString(count: number, createdMocked: () => string): string {
    const tagString = randomMockedString(count, createdMocked);
    return '[' + tagString + ']';
}

export function randomMockedString(count: number, createdMocked: () => string): string {
    if (count === 0) return '';
    const items = range(count);
    const itemsAsStrings = items.map(() => createdMocked());

    const tagString = itemsAsStrings.join(',');

    return tagString;
}
