declare class OpaqueTag<S extends string> {
    private tag: S;
}

/**
 * Opague - get rid of primitive obsession
 * @example
 * ```
 * export type ErrorMessage = Opaque<string, 'ErrorMessage'>;
 * const errorMessage = `This is an error message` as ErrorMessage
 * ```
 * - It is not possible to assign strings or other types to an opaque type variable. It will be a compile error.
 * - String literals should be annotated with the correct type when assigning to an opaque type variable.
 * - The variable holds just a string so there is no runtime overhead.
 * - Serialization/Deserialization works out of the box.
 * @link http://alisabzevari.github.io/2020/01/21/2020-01-21-typescript-opaque-types/
 */
export type Opaque<T, S extends string> = T & OpaqueTag<S>;
