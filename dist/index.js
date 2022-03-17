"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Changeset = exports.SchemaBuilder = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importStar(require("lodash"));
const numberValidators_1 = tslib_1.__importDefault(require("./numberValidators"));
const typeMapper_1 = tslib_1.__importDefault(require("./typeMapper"));
const types_1 = tslib_1.__importDefault(require("./types"));
const LengthValidators = {
    min: (value, length) => {
        return value.length >= length;
    },
    max: (value, length) => {
        return value.length <= length;
    },
    is: (value, length) => {
        return value.length === length;
    }
};
const defaultOpts = {
    default: undefined,
    virtual: false
};
class SchemaBuilder {
    constructor() {
        this.fields = {};
    }
    build() {
        return this.fields;
    }
    addField(name, type, opts) {
        const mergedOpts = Object.assign(Object.assign({}, defaultOpts), opts);
        this.fields[name] = [type, mergedOpts];
    }
    integer(name, opts) {
        this.addField(name, types_1.default.Integer, opts);
        return this;
    }
    float(name, opts) {
        this.addField(name, types_1.default.Float, opts);
        return this;
    }
    string(name, opts) {
        this.addField(name, types_1.default.String, opts);
        return this;
    }
    boolean(name, opts) {
        this.addField(name, types_1.default.Boolean, opts);
        return this;
    }
    binary(name, opts) {
        this.addField(name, types_1.default.Binary, opts);
        return this;
    }
    decimal(name, opts) {
        this.addField(name, types_1.default.Decimal, opts);
        return this;
    }
}
exports.SchemaBuilder = SchemaBuilder;
class Changeset {
    constructor(data, schema) {
        this.changes = {};
        this.errors = [];
        this.data = data;
        this.schema = schema;
    }
    getCastFunction(field) {
        const type = this.schema[field];
        if (!type === undefined) {
            throw new Error(`unknown field ${field} given to cast.`);
        }
        return typeMapper_1.default[type[0]];
    }
    getFieldOptions(field) {
        var _a;
        return (_a = this.schema[field]) === null || _a === void 0 ? void 0 : _a[1];
    }
    transformErrors() {
        return this.errors.reduce((acc, { field, message }) => {
            (acc[field] || (acc[field] = [])).push(message);
            return acc;
        }, {});
    }
    cast(params, permitted, { trimStrings = true } = {}) {
        const changes = Object.entries(params).reduce((acc, [key, value]) => {
            if (!permitted.includes(key))
                return acc;
            const castFunction = this.getCastFunction(key);
            let castValue = castFunction(value);
            if (trimStrings && typeof castValue === "string")
                castValue = castValue.trim();
            // there is no change if the values are equal
            if (castValue === this.data[key])
                return acc;
            return Object.assign(Object.assign({}, acc), { [key]: castValue || null });
        }, {});
        this.changes = Object.assign(Object.assign({}, this.changes), changes);
        return this;
    }
    validateRequired(fields) {
        fields.forEach((field) => {
            const value = this.getField(field);
            if (["", null, undefined].includes(value)) {
                this.errors.push({ field, message: "can't be blank" });
            }
        });
        return this;
    }
    validateNumber(field, opts) {
        const value = this.getField(field);
        if (typeof value !== "number")
            return this;
        Object.entries(opts).forEach(([validatorKey, expected]) => {
            const validator = numberValidators_1.default[validatorKey];
            if (!validator || validator(value, expected))
                return;
            const errorType = lodash_1.default.snakeCase(validatorKey).replace(/_/g, " ");
            this.errors.push({
                field,
                message: `must be ${errorType} ${expected}`
            });
        });
        return this;
    }
    validateLength(field, opts) {
        const value = this.getField(field);
        if (typeof value !== "string") {
            return this;
        }
        Object.entries(opts).forEach(([validatorKey, expected]) => {
            const validator = LengthValidators[validatorKey];
            if (!validator || validator(value, expected))
                return;
            this.errors.push({
                field,
                message: `length is invalid, expected: ${validatorKey}: ${expected}`
            });
        });
        return this;
    }
    validateFormat(field, format, message) {
        const value = this.getField(field);
        if (typeof value !== "string") {
            return this;
        }
        if (!value.match(format)) {
            this.errors.push({
                field,
                message: message !== null && message !== void 0 ? message : `has invalid format`
            });
        }
        return this;
    }
    isChanged(field) {
        return this.changes.hasOwnProperty(field);
    }
    getChange(field) {
        if (this.changes.hasOwnProperty(field)) {
            return this.changes[field];
        }
    }
    getField(field) {
        var _a;
        return (_a = this.getChange(field)) !== null && _a !== void 0 ? _a : this.data[field];
    }
    get valid() {
        return this.errors.length === 0;
    }
    tap(fn) {
        return fn(this);
    }
    applyChanges() {
        return Object.assign(Object.assign({}, this.data), this.changes);
    }
    toPromise() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this;
        });
    }
    toPrismaParams() {
        return Object.entries(this.changes).reduce((acc, [key, value]) => {
            const opts = this.getFieldOptions(key);
            if (opts.virtual)
                return acc;
            if (key.match(/Id$/)) {
                const relation = key.replace(/Id$/, "");
                if ([null, undefined].includes(value))
                    return acc;
                return Object.assign(Object.assign({}, acc), { [relation]: { connect: { id: value } } });
            }
            return Object.assign(Object.assign({}, acc), { [key]: value !== null && value !== void 0 ? value : opts.default });
        }, {});
    }
    toSnakeCaseParams() {
        return Object.entries(this.changes).reduce((acc, [key, value]) => {
            const opts = this.getFieldOptions(key);
            if (opts.virtual)
                return acc;
            const snakeKey = (0, lodash_1.snakeCase)(key);
            return Object.assign(Object.assign({}, acc), { [snakeKey]: value !== null && value !== void 0 ? value : opts.default });
        }, {});
    }
    addError(field, message) {
        this.errors.push({ field, message });
        return this;
    }
    putChange(field, value) {
        this.changes[field] = value;
        return this;
    }
}
exports.Changeset = Changeset;
//# sourceMappingURL=index.js.map