declare const NumberValidators: {
    lessThan: (value: number, expected: number) => boolean;
    greaterThan: (value: number, expected: number) => boolean;
    greaterThanOrEqualTo: (value: number, expected: number) => boolean;
    lessThanOrEqualTo: (value: number, expected: number) => boolean;
};
export default NumberValidators;
