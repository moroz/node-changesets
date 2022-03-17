import { Schema, SchemaFieldOptions, Struct, ChangesetError, CastOptions } from "./common";
import NumberValidators from "./numberValidators";
import Types from "./types";
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
    validateFormat(field: string, format: RegExp, message?: string): this;
    isChanged(field: string): boolean;
    getChange(field: string): any;
    getField(field: string): any;
    get valid(): boolean;
    tap(fn: (changeset: Changeset<T>) => Changeset<T>): Changeset<T>;
    applyChanges(): Record<string, any>;
    toPromise(): Promise<this>;
    toPrismaParams(): T;
    toSnakeCaseParams(): T;
    addError(field: keyof Schema, message: string): this;
    putChange(field: keyof Schema, value: any): this;
}
export {};
