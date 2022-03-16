export interface CastOptions {
    trimStrings?: boolean;
}
export declare enum Types {
    Integer = 0,
    Binary = 1,
    Float = 2,
    Boolean = 3,
    String = 4,
    Decimal = 5
}
export interface SchemaFieldOptions {
    default?: any;
    virtual?: boolean;
}
export declare type SchemaFieldTuple = [Types, SchemaFieldOptions];
export declare type SchemaField = SchemaFieldTuple;
export declare type Schema = Record<string, SchemaField>;
export declare type CastFunction = (value: any) => any;
export declare type Struct = Record<string, any>;
export declare type UntypedParams = Record<string, any>;
export declare type ChangesetChange = Record<string, any>;
export interface ChangesetError {
    field: string;
    message: string;
}
export declare const TypeMapper: Record<Types, CastFunction>;
export declare const NumberValidators: {
    lessThan: (value: number, expected: number) => boolean;
    greaterThan: (value: number, expected: number) => boolean;
    greaterThanOrEqualTo: (value: number, expected: number) => boolean;
    lessThanOrEqualTo: (value: number, expected: number) => boolean;
};
declare const LengthValidators: {
    min: (value: string, length: number) => boolean;
    max: (value: string, length: number) => boolean;
    is: (value: string, length: number) => boolean;
};
export declare class SchemaBuilder {
    fields: Schema;
    build(): Schema;
    addField(name: string, type: Types, opts?: SchemaFieldOptions): void;
    integer(name: string, opts?: SchemaFieldOptions): this;
    float(name: string, opts?: SchemaFieldOptions): this;
    string(name: string, opts?: SchemaFieldOptions): this;
    boolean(name: string, opts?: SchemaFieldOptions): this;
    binary(name: string, opts?: SchemaFieldOptions): this;
    decimal(name: string, opts?: SchemaFieldOptions): this;
}
export declare class Changeset<T extends Struct = any> {
    data: Struct;
    schema: Schema;
    changes: Record<keyof Schema, any>;
    errors: ChangesetError[];
    constructor(data: Struct, schema: Schema);
    private getCastFunction;
    private getFieldOptions;
    transformErrors(): Record<string, string[]>;
    cast(params: Record<string, any>, permitted: string[], { trimStrings }?: CastOptions): this;
    validateRequired(fields: string[]): this;
    validateNumber(field: string, opts: Partial<Record<keyof typeof NumberValidators, number>>): this;
    validateLength(field: string, opts: Partial<Record<keyof typeof LengthValidators, number>>): this;
    isChanged(field: string): boolean;
    getChange(field: string): any;
    getField(field: string): any;
    get valid(): boolean;
    tap(fn: (changeset: Changeset<T>) => Changeset<T>): Changeset<T>;
    applyChanges(): Record<string, any>;
    toPromise(): Promise<this>;
    toPrismaParams(): T;
    addError(field: keyof Schema, message: string): this;
    putChange(field: keyof Schema, value: any): this;
}
export {};
