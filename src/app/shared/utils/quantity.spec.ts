import { compareQty, percentOf, formatQty, isPositiveQty, sumQty } from './quantity';

describe('quantities', () => {
  it('formats without trailing zeros', () => {
    expect(formatQty('21.00')).toBe('21');
    expect(formatQty('2.50')).toBe('2.5');
    expect(formatQty('-3.00')).toBe('-3');
    expect(formatQty('0.05')).toBe('0.05');
    expect(formatQty('abc')).toBe('abc');
  });

  it('compares and sums exactly', () => {
    expect(compareQty('0.1', '0.10')).toBe(0);
    expect(compareQty('20.5', '21')).toBe(-1);
    expect(compareQty('21.01', '21')).toBe(1);
    expect(sumQty(['0.1', '0.2', '15'])).toBe('15.3');
    expect(sumQty(['5', '-7.25'])).toBe('-2.25');
  });

  it('accepts only positive quantities with two decimals', () => {
    expect(isPositiveQty('1')).toBe(true);
    expect(isPositiveQty('0.01')).toBe(true);
    expect(isPositiveQty('0')).toBe(false);
    expect(isPositiveQty('-1')).toBe(false);
    expect(isPositiveQty('1.005')).toBe(false);
    expect(isPositiveQty('')).toBe(false);
  });

  it('gives a share in percent', () => {
    expect(percentOf('20', '21')).toBe(95);
    expect(percentOf(null, '21')).toBe(0);
    expect(percentOf('12', '10')).toBe(100);
    expect(percentOf('1', '0')).toBe(0);
  });
});
