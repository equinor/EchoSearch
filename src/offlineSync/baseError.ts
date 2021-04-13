import { isNullOrEmpty } from './Utils/stringExtensions';

//TODO Ove use Base error from echo CORE
export class BaseError extends Error {
    properties: ErrorProperties;
    hasBeenLogged: boolean;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(message: string, exception?: any) {
        super(message);
        this.properties = exception ? { ...exception } : {};

        this.name = this.constructor.name;
        this.hasBeenLogged = false;
        if (isNullOrEmpty(message)) {
            this.message = this.name;
        }
    }

    addProperties(values: ErrorProperties): void {
        this.properties = { ...this.properties, ...values };
    }
}
interface ErrorProperties {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; //support any properties in exception/error
}
