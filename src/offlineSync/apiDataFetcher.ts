import { apiFetchJsonToArray, apiFetchToType } from '../service/workerFetch';
import { getApiBaseUrl } from './syncSettings';

export interface FailureRate {
    percentage: number;
    httpStatusErrorCode: number;
    httpErrorMessage: string;
}

export const defaultFailureRate: FailureRate = {
    percentage: 0,
    httpStatusErrorCode: 500,
    httpErrorMessage: 'oh no, something went wrong'
};

export class ApiFetchState {
    private _isMockEnabled: boolean;
    private _failureRate: FailureRate;

    constructor() {
        this._isMockEnabled = false;
        this._failureRate = defaultFailureRate;
    }

    set isMockEnabled(isEnabled: boolean) {
        this._isMockEnabled = isEnabled;
    }
    get isMockEnabled(): boolean {
        return this._isMockEnabled;
    }

    get failureRate(): FailureRate {
        return this._failureRate;
    }

    set failureRate(failureRate: FailureRate) {
        this._failureRate = failureRate;
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

    /**
     * Fetches data from the url, and returns a list of the specified type T.
     * - The data is parsed and cleaned.
     * - It uses mock data instead if mock flag is set.
     * - Chance to return error instead if failureRate percentage is set.
     * @param url The url to fetch the data from
     * @param getMockData A string containing mocked JSON data
     * @param abortSignal Optional, to abort the fetch call
     * @param responseInspector Optional function for inspecting the response
     * @returns A list of data of Type T, parsed and cleaned
     */
    async fetchAll(
        url: string,
        getMockData: () => string,
        abortSignal?: AbortSignal,
        responseInspector?: (response: Response) => void
    ): Promise<T[]> {
        try {
            const items: T[] = this._state.isMockEnabled
                ? JSON.parse(getMockData())
                : await apiFetchJsonToArray<T>(this.urlOrFakeError(url), abortSignal, responseInspector);
            return items.map((item) => this.cleanup(item));
        } catch (e) {
            // console.log('Error', url, e); //TODO - error logging of json
            // if (this._state.isMockEnabled) console.log(getMockData());
            throw e;
        }
    }

    async fetchSingle<R>(
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

    private urlOrFakeError(url: string): string {
        if (!this.isRandomFailure()) return url;
        return `${getApiBaseUrl()}/TroubleShooting/FakeError?httpStatusCode=${
            this.state.failureRate.httpStatusErrorCode
        }&message=${this.state.failureRate.httpErrorMessage}`;
    }

    private isRandomFailure(): boolean {
        const chanceValue = this.randomInt(0, 100);
        return chanceValue < this._state.failureRate.percentage;
    }

    private randomInt(minIncluded: number, maxIncluded: number): number {
        return Math.floor(Math.random() * (maxIncluded - minIncluded + 1) + minIncluded);
    }
}
