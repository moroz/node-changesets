const NumberValidators = {
  lessThan: (value: number, expected: number) => {
    return value < expected;
  },
  greaterThan: (value: number, expected: number) => {
    return value > expected;
  },
  greaterThanOrEqualTo: (value: number, expected: number) => {
    return value >= expected;
  },
  lessThanOrEqualTo: (value: number, expected: number) => {
    return value >= expected;
  }
};

export default NumberValidators;
