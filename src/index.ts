import _, { snakeCase } from "lodash";
import {
  Schema,
  SchemaFieldOptions,
  Struct,
  ChangesetError,
  CastOptions
} from "./common";
import NumberValidators from "./numberValidators";
import TypeMapper from "./typeMapper";
import Types from "./types";

const LengthValidators = {
  min: (value: string, length: number) => {
    return value.length >= length;
  },
  max: (value: string, length: number) => {
    return value.length <= length;
  },
  is: (value: string, length: number) => {
    return value.length === length;
  }
};

const defaultOpts = {
  default: undefined,
  virtual: false
};

export class SchemaBuilder {
  fields: Schema = {};

  build() {
    return this.fields;
  }

  addField(name: string, type: Types, opts?: SchemaFieldOptions) {
    const mergedOpts = { ...defaultOpts, ...opts };
    this.fields[name] = [type, mergedOpts];
  }

  integer(name: string, opts?: SchemaFieldOptions) {
    this.addField(name, Types.Integer, opts);
    return this;
  }

  float(name: string, opts?: SchemaFieldOptions) {
    this.addField(name, Types.Float, opts);
    return this;
  }

  string(name: string, opts?: SchemaFieldOptions) {
    this.addField(name, Types.String, opts);
    return this;
  }

  boolean(name: string, opts?: SchemaFieldOptions) {
    this.addField(name, Types.Boolean, opts);
    return this;
  }

  binary(name: string, opts?: SchemaFieldOptions) {
    this.addField(name, Types.Binary, opts);
    return this;
  }

  decimal(name: string, opts?: SchemaFieldOptions) {
    this.addField(name, Types.Decimal, opts);
    return this;
  }
}

export class Changeset<T extends Struct = any> {
  data: Struct;
  schema: Schema;
  changes: Record<keyof Schema, any> = {};
  errors: ChangesetError[] = [];

  constructor(data: Struct, schema: Schema) {
    this.data = data;
    this.schema = schema;
  }

  private getCastFunction(field: keyof typeof this.schema) {
    const type = this.schema[field];
    if (!type === undefined) {
      throw new Error(`unknown field ${field} given to cast.`);
    }
    return TypeMapper[type[0]];
  }

  private getFieldOptions(field: keyof typeof this.schema) {
    return this.schema[field]?.[1];
  }

  transformErrors() {
    return this.errors.reduce((acc, { field, message }) => {
      (acc[field] || (acc[field] = [])).push(message);
      return acc;
    }, {} as Record<string, string[]>);
  }

  cast(
    params: Record<string, any>,
    permitted: string[],
    { trimStrings = true }: CastOptions = {}
  ) {
    const changes = Object.entries(params).reduce((acc, [key, value]) => {
      if (!permitted.includes(key)) return acc;
      const castFunction = this.getCastFunction(key);
      let castValue = castFunction(value);
      if (trimStrings && typeof castValue === "string")
        castValue = castValue.trim();

      // there is no change if the values are equal
      if (castValue === this.data[key]) return acc;

      return {
        ...acc,
        [key]: castValue || null
      };
    }, {});
    this.changes = { ...this.changes, ...changes };
    return this;
  }

  validateRequired(fields: string[]) {
    fields.forEach((field) => {
      const value = this.getField(field);
      if (["", null, undefined].includes(value)) {
        this.errors.push({ field, message: "can't be blank" });
      }
    });
    return this;
  }

  validateNumber(
    field: string,
    opts: Partial<Record<keyof typeof NumberValidators, number>>
  ) {
    const value = this.getField(field);
    if (typeof value !== "number") return this;

    Object.entries(opts).forEach(([validatorKey, expected]) => {
      const validator =
        NumberValidators[validatorKey as keyof typeof NumberValidators];
      if (!validator || validator(value, expected)) return;
      const errorType = _.snakeCase(validatorKey).replace(/_/g, " ");
      this.errors.push({
        field,
        message: `must be ${errorType} ${expected}`
      });
    });
    return this;
  }

  validateLength(
    field: string,
    opts: Partial<Record<keyof typeof LengthValidators, number>>
  ) {
    const value = this.getField(field);
    if (typeof value !== "string") {
      return this;
    }

    Object.entries(opts).forEach(([validatorKey, expected]) => {
      const validator =
        LengthValidators[validatorKey as keyof typeof LengthValidators];

      if (!validator || validator(value, expected)) return;

      this.errors.push({
        field,
        message: `length is invalid, expected: ${validatorKey}: ${expected}`
      });
    });
    return this;
  }

  validateFormat(field: string, format: RegExp, message?: string) {
    const value = this.getField(field);
    if (typeof value !== "string") {
      return this;
    }

    if (!value.match(format)) {
      this.errors.push({
        field,
        message: message ?? `has invalid format`
      });
    }
    return this;
  }

  isChanged(field: string) {
    return this.changes.hasOwnProperty(field);
  }

  getChange(field: string) {
    if (this.changes.hasOwnProperty(field)) {
      return this.changes[field as keyof typeof this.schema];
    }
  }

  getField(field: string) {
    return this.getChange(field) ?? this.data[field];
  }

  get valid(): boolean {
    return this.errors.length === 0;
  }

  tap(fn: (changeset: Changeset<T>) => Changeset<T>) {
    return fn(this);
  }

  applyChanges() {
    return {
      ...this.data,
      ...this.changes
    } as Record<string, any>;
  }

  async toPromise() {
    return this;
  }

  toPrismaParams() {
    return Object.entries(this.changes).reduce((acc, [key, value]) => {
      const opts = this.getFieldOptions(key);
      if (opts.virtual) return acc;

      if (key.match(/Id$/)) {
        const relation = key.replace(/Id$/, "");
        if ([null, undefined].includes(value as any)) return acc;
        return { ...acc, [relation]: { connect: { id: value } } };
      }
      return { ...acc, [key]: value ?? opts.default };
    }, {}) as T;
  }

  toSnakeCaseParams() {
    return Object.entries(this.changes).reduce((acc, [key, value]) => {
      const opts = this.getFieldOptions(key);
      if (opts.virtual) return acc;

      const snakeKey = snakeCase(key);
      return { ...acc, [snakeKey]: value ?? opts.default };
    }, {}) as T;
  }

  addError(field: keyof Schema, message: string) {
    this.errors.push({ field, message });
    return this;
  }

  putChange(field: keyof Schema, value: any) {
    this.changes[field as any] = value;
    return this;
  }
}
