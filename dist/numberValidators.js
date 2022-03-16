"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NumberValidators = {
    lessThan: (value, expected) => {
        return value < expected;
    },
    greaterThan: (value, expected) => {
        return value > expected;
    },
    greaterThanOrEqualTo: (value, expected) => {
        return value >= expected;
    },
    lessThanOrEqualTo: (value, expected) => {
        return value >= expected;
    }
};
exports.default = NumberValidators;
//# sourceMappingURL=numberValidators.js.map