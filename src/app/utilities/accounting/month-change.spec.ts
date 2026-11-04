import { money } from '@utilities/money';
import { monthChange } from './month-change';

describe('monthChange', () => {
  it('compares money and counts with the month before', () => {
    expect(monthChange(money('15.000'), money('10.000'))).toBe(50);
    expect(monthChange(8, 10)).toBe(-20);
    expect(monthChange(0, 0)).toBe(0);
    expect(monthChange(money('5.000'), money('0.000'))).toBeNull();
  });
});
