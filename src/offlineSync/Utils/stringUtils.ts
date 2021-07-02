import { ArgumentDateError } from '../../baseResult';

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

export function dateAsApiString(date: Date | string): string {
    if (!date) {
        throw new ArgumentDateError('dateAsApiString - date is undefined');
    }

    return new Date(date).toISOString();
}
