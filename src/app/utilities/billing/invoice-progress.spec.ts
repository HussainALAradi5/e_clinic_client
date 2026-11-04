import { StatusTone } from '@enums/ui/status-tone.enum';
import { money } from '@utilities/money';
import { paidPercent, paidTone } from './invoice-progress';

describe('invoice progress', () => {
  it('works out the paid share in fils', () => {
    expect(paidPercent({ total: money('15.000'), balanceDue: money('15.000') })).toBe(0);
    expect(paidPercent({ total: money('15.000'), balanceDue: money('5.000') })).toBe(66);
    expect(paidPercent({ total: money('15.000'), balanceDue: money('0.000') })).toBe(100);
    expect(paidPercent({ total: money('0.000'), balanceDue: money('0.000') })).toBe(100);
  });

  it('colours nothing paid, part paid and settled', () => {
    expect(paidTone(0)).toBe(StatusTone.Amber);
    expect(paidTone(40)).toBe(StatusTone.Blue);
    expect(paidTone(100)).toBe(StatusTone.Green);
  });
});
