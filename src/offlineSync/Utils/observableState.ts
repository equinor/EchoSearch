import { BehaviorSubject, distinctUntilChanged, skip } from 'rxjs';

export type UnsubscribeFunction = () => void;

export interface ObservableStateReadonly<T> {
    subscribe(callback: (value: T) => void): UnsubscribeFunction;
    subscribeOnlyChanged(callback: (value: T) => void): UnsubscribeFunction;
    getValue: () => T;
}

export class ObservableState<T> implements ObservableStateReadonly<T> {
    protected _value: BehaviorSubject<T>;
    constructor(value: T) {
        this._value = new BehaviorSubject(value);
    }

    getValue(): T {
        return this._value.getValue();
    }

    setValue(value: T): void {
        return this._value.next(value);
    }

    subscribe(callback: (value: T) => void): UnsubscribeFunction {
        const sub = this._value.pipe(skip(1)).subscribe((item) => callback(item));
        return () => sub.unsubscribe();
    }

    subscribeOnlyChanged(callback: (value: T) => void): UnsubscribeFunction {
        console.log('subscribe called');
        const sub = this._value
            .pipe(skip(1)) //we don't want the callback on initial value
            .pipe(distinctUntilChanged())
            .subscribe((item) => callback(item));
        return () => sub.unsubscribe();
    }
}
