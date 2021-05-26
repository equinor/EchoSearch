export class ToggleState {
    private _isEnabled: boolean;
    constructor(isEnabled: boolean) {
        this._isEnabled = isEnabled;
    }

    get isEnabled(): boolean {
        return this._isEnabled;
    }

    toggle(): void {
        this._isEnabled = !this._isEnabled;
    }

    setEnabled(isEnabled: boolean): void {
        this._isEnabled = isEnabled;
    }
}
