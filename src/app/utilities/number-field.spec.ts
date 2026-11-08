import { normaliseNumber, sanitizeNumber, stepNumber } from '@utilities/number-field';

const whole = { min: 0, max: null, step: 1, decimals: 0 };
const money = { min: 0, max: 1000, step: 0.5, decimals: 3 };

describe('number field', () => {
  it('keeps numbers only, with no minus sign', () => {
    expect(sanitizeNumber('-12a3', 0)).toBe('123');
    expect(sanitizeNumber('1.5', 0)).toBe('15');
    expect(sanitizeNumber('1.2345.6', 3)).toBe('1.234');
  });

  it('never goes below zero', () => {
    expect(stepNumber('0', -1, whole)).toBe('0');
    expect(stepNumber('0.250', -1, money)).toBe('0.000');
    expect(normaliseNumber('-5', whole)).toBe('0');
  });

  it('steps exactly, starts from the minimum when empty and stops at the maximum', () => {
    expect(stepNumber('2.500', 1, money)).toBe('3.000');
    expect(stepNumber(null, 1, whole)).toBe('1');
    expect(stepNumber('999.800', 1, money)).toBe('1000.000');
  });

  it('leaves an empty value empty', () => {
    expect(normaliseNumber(null, money)).toBeNull();
    expect(normaliseNumber('', money)).toBeNull();
  });
});
