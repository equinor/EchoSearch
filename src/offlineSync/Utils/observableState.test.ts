import { ObservableState } from './observableState';

describe('observable state', () => {
    it('should setValue, and getValue should be equal', () => {
        const observable = new ObservableState(false);
        expect(observable.getValue()).toBe(false);
        observable.setValue(true);
        expect(observable.getValue()).toBe(true);
        observable.setValue(false);
        expect(observable.getValue()).toBe(false);
    });

    it('subscribe should run callback on all new values (also on equal values)', () => {
        let counter = 0;
        const observable = new ObservableState(false);
        observable.setValue(true);
        observable.setValue(false);
        observable.setValue(true);
        const unsubscribe = observable.subscribe(() => counter++);
        observable.setValue(true);
        observable.setValue(true);
        unsubscribe();
        expect(counter).toBe(2);
    });

    it('subscribe should run callback on new values only if value changed', () => {
        let counter = 0;
        const observable = new ObservableState(false);
        observable.setValue(true);
        observable.setValue(false);
        observable.setValue(true);
        const unsubscribe = observable.subscribeOnlyChanged(() => counter++);
        observable.setValue(true);
        observable.setValue(true);
        unsubscribe();
        expect(counter).toBe(1);
    });

    it('subscribe callback argument should have correct value', () => {
        const observable = new ObservableState(false);
        let callbackValueArgument = false;
        const unsubscribe = observable.subscribeOnlyChanged((item) => (callbackValueArgument = item));
        observable.setValue(true);
        expect(callbackValueArgument).toBe(true);
        observable.setValue(false);
        expect(callbackValueArgument).toBe(false);
        unsubscribe();
    });

    it('unsubscribe should stop receiving updates', () => {
        let counter = 0;
        const observable = new ObservableState(false);
        const unsubscribe = observable.subscribe(() => counter++);
        observable.setValue(true);
        unsubscribe();
        observable.setValue(false);
        expect(counter).toBe(1);
    });

    it('late 2nd subscriber should only execute callback for new values', () => {
        let counter = 0;
        let counter2 = 0;
        const observable = new ObservableState(false);
        const unsubscribe = observable.subscribe(() => counter++);
        observable.setValue(true);
        observable.setValue(true);
        const unsubscribe2 = observable.subscribe(() => counter2++);
        expect(counter2).toBe(0);
        observable.setValue(true);
        observable.setValue(true);

        unsubscribe();
        unsubscribe2();
        expect(counter).toBe(4);
        expect(counter2).toBe(2);
    });
});
