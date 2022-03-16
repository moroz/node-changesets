import Types from "./types";
export interface CastOptions {
    trimStrings?: boolean;
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
