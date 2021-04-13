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
    getKeyValue: (arg: T) => string;
    isReadyFlag: boolean;
    alphabeticSort: (a: T, b: T) => number;
    constructor(getKeyValue: (arg: T) => string) {
        this.isReadyFlag = false;
        this.inMemoryData = [] as T[];
        this.getKeyValue = getKeyValue;
        this.alphabeticSort = (a, b) => {
            return this.getKeyValue(a) > this.getKeyValue(b) ? 1 : -1;
        };
    }

    isReady(): boolean {
        return this.isReadyFlag;
    }

    all(): ReadonlyArray<T> {
        return this.inMemoryData;
    }

    length(): number {
        return this.inMemoryData.length;
    }

    clearData(): void {
        this.isReadyFlag = false;
        this.inMemoryData = [] as T[];
    }

    clearAndInit(data: T[]): void {
        const newData = [...data];
        newData.sort(this.alphabeticSort);
        this.inMemoryData = newData;
        this.isReadyFlag = true; //no need to set it to false in start of method, cause we already have old data we can use for searching
    }

    /**
     * Updates existing items (with matching keys). Adds new items (not found by key).
     * @param updateItems
     */
    updateItems(updateItems: T[]): void {
        //not thread safe? - abort if clearAndInit is called?
        updateItems.forEach((item) => {
            const index = this.indexOfBinarySearch(this.getKeyValue(item));
            if (index >= 0) {
                this.inMemoryData[index] = item; //update existing item
            } else {
                this.inMemoryData.push(item);
            }
        });
        this.inMemoryData.sort(this.alphabeticSort);
    }

    /**
     * Removes items with matching key.
     * @param itemsToBeRemoved Items to be removed
     */
    removeItems(itemsToBeRemoved: T[]): void {
        //not thread safe? - abort if clearAndInit is called?
        itemsToBeRemoved.forEach((itemToDelete) => {
            const index = this.indexOfBinarySearch(this.getKeyValue(itemToDelete));
            if (index > -1) {
                this.inMemoryData.splice(index, 1);
            }
        });
    }

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
}
