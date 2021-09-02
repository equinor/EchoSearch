export function randomFrom<T>(data: T[]): T {
    const index = randomIntBetween(0, data.length - 1);
    return data[index];
}

function randomIntBetween(includeMin: number, includeMax: number): number {
    const max = Math.max(includeMin, includeMax);
    const min = Math.min(includeMin, includeMax);
    return Math.floor(Math.random() * (max - min + 1) + min);
}
