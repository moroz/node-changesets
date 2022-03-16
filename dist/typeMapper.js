"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const buffer_1 = require("buffer");
const types_1 = tslib_1.__importDefault(require("./types"));
const TypeMapper = {
    [types_1.default.Integer]: Number,
    [types_1.default.Float]: Number,
    [types_1.default.String]: (value) => (value ? String(value) : null),
    [types_1.default.Decimal]: (value) => (value ? String(value) : null),
    [types_1.default.Binary]: buffer_1.Buffer.from,
    [types_1.default.Boolean]: Boolean
};
exports.default = TypeMapper;
//# sourceMappingURL=typeMapper.js.map