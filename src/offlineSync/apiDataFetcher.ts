import { apiFetchJsonToArray, apiFetchToType } from '../service/workerFetch';
import { baseApiUrl } from './syncSettings';

export class ApiFetchState {
    private _isMockEnabled: boolean;
    private _failureRate: number;

    constructor() {
        this._isMockEnabled = false;
        this._failureRate = 0;
    }

    set isMockEnabled(isEnabled: boolean) {
        this._isMockEnabled = isEnabled;
    }
    get isMockEnabled(): boolean {
        return this._isMockEnabled;
    }

    get failureRate(): number {
        return this._failureRate;
    }

    /**
     * Sets the failure rate when getting data from api/url. Used for debugging
     */
    set failureRate(value: number) {
        this._failureRate = value;
    }

    toggleMock(): void {
        this.isMockEnabled = !this.isMockEnabled;
    }
}

export class ApiDataFetcher<T> {
    private _state: ApiFetchState;
    private cleanup: (values: T) => T;

    /**
     * Fetch all data from url. With Optionally state: for mock data, or failure rate for debugging.
     * @param cleanup Map/Cleanup function to run on each item returned from the api.
     */
    constructor(cleanup: (values: T) => T) {
        this.cleanup = cleanup;
        this._state = new ApiFetchState();
    }

    get state(): ApiFetchState {
        return this._state;
    }

    async fetchAll(url: string, abortSignal: AbortSignal, getMockData: () => string): Promise<T[]> {
        const items: T[] = this._state.isMockEnabled
            ? JSON.parse(getMockData())
            : await apiFetchJsonToArray<T>(this.urlOrFakeError(url), abortSignal);
        return items.map((item) => this.cleanup(item));
    }

    async fetch<R>(
        url: string,
        abortSignal: AbortSignal,
        cleanup: (values: R) => R,
        getMockData: () => string
    ): Promise<R> {
        const item: R = this._state.isMockEnabled
            ? JSON.parse(getMockData())
            : await apiFetchToType<R>(this.urlOrFakeError(url), abortSignal);
        return cleanup(item);
    }

    private urlOrFakeError(url: string, httpStatusCode = 403, errorMessage = 'errorMessage'): string {
        const chanceValue = this.randomInt(0, 100);
        const isFailure = chanceValue < this._state.failureRate;
        console.log('Failure roll:', chanceValue, this._state.failureRate, isFailure); //TODO remove
        if (!isFailure) return url;
        return `${baseApiUrl}/TroubleShooting/FakeError?httpStatusCode=${httpStatusCode}&message=${errorMessage}`;
    }

    private randomInt(minIncluded: number, maxIncluded: number): number {
        return Math.floor(Math.random() * (maxIncluded - minIncluded + 1) + minIncluded);
    }
}
