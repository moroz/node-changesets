import Types from "./types";

export interface CastOptions {
  trimStrings?: boolean;
}

export interface SchemaFieldOptions {
  default?: any;
  virtual?: boolean;
}

export type SchemaFieldTuple = [Types, SchemaFieldOptions];
export type SchemaField = SchemaFieldTuple;
export type Schema = Record<string, SchemaField>;
export type CastFunction = (value: any) => any;
export type Struct = Record<string, any>;
export type UntypedParams = Record<string, any>;
export type ChangesetChange = Record<string, any>;
export interface ChangesetError {
  field: string;
  message: string;
}
