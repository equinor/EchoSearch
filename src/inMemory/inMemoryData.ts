//import handleErrors from '../../utils/handleErrors';

//import { offlineDb } from './dexieDB';

export function clearAllInMemoryKeys(): void {
    // clearInMemoryTags();
    // clearInMemoryDocuments();
    // clearInMemoryTotalEntries();
    // clearInMemoryCommPacks();
    // clearInMemoryMcPacks();
    // clearInMemoryPunches();
    // clearInMemoryNotifications();
}

export class InMemoryData<T> {
    inMemoryData: T[];
    sortBy?: (a: T, b: T) => number;
    getKeyValue: (arg: T) => string;
    isReadyFlag: boolean;

    constructor(getKeyValue: (arg: T) => string, sortBy?: (a: T, b: T) => number) {
        this.isReadyFlag = false;
        this.inMemoryData = [] as T[];
        this.sortBy = sortBy; //TODO use getKeyValue for sort by, and not in parameter
        this.getKeyValue = getKeyValue;
    }

    isReady(): boolean {
        return this.isReadyFlag;
    }

    all(): ReadonlyArray<T> {
        return this.inMemoryData;
    }

    clearAndInit(data: T[]) {
        this.isReadyFlag = false;
        const newData = [...data];
        newData.sort(this.sortBy);
        this.inMemoryData = newData;
        this.isReadyFlag = true;
    }

    updateData(data: T[]): void {
        data.forEach((item) => {
            const index = this.indexOfBinarySearch(this.getKeyValue(item));
            if (index >= 0) {
                this.inMemoryData[index] = item; //update existing item
            } else {
                this.inMemoryData.push(item);
            }
        });
        this.inMemoryData.sort(this.sortBy);
    }

    //TODO delete data

    indexOfBinarySearch(key: string): number {
        let minNum = 0;
        let maxNum = this.inMemoryData.length - 1;

        while (minNum <= maxNum) {
            const mid = Math.floor((minNum + maxNum) / 2);
            if (key === this.getKeyValue(this.inMemoryData[mid])) {
                return mid;
            } else if (key.localeCompare(this.getKeyValue(this.inMemoryData[mid])) < 0) {
                maxNum = mid - 1;
            } else {
                minNum = mid + 1;
            }
        }

        return -1;
    }

    clearData(): void {
        this.isReadyFlag = false;
        this.inMemoryData = [] as T[];
    }

    length(): number {
        return this.inMemoryData.length;
    }
}
