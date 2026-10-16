import { formatMoney, normaliseAmount } from './money';
import { Currency } from '@shared/enums/shared/currency.enum';

describe('money', () => {
  it('normalises to 3 decimals without floats', () => {
    expect(normaliseAmount('25.5')).toBe('25.500');
    expect(normaliseAmount('1,250')).toBe('1250.000');
    expect(normaliseAmount('1.2345')).toBeNull();
    expect(normaliseAmount('abc')).toBeNull();
  });

  it('formats like MoneyHelper::format with grouping', () => {
    expect(formatMoney({ amount: '1250.5', currency: Currency.BHD })).toBe('BHD 1,250.500');
    expect(formatMoney({ amount: '-3', currency: Currency.USD })).toBe('USD -3.000');
    expect(formatMoney(null)).toBe('');
  });
});
