import { divideHalfUp, formatMoney, fromMinor, normaliseAmount, toMinor, toScaled } from './money';
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

describe('exact money arithmetic', () => {
  it('converts to and from fils without floats', () => {
    expect(toMinor('25.5')).toBe(25500n);
    expect(toMinor('-0.005')).toBe(-5n);
    expect(toMinor('x')).toBeNull();
    expect(fromMinor(25500n)).toBe('25.500');
    expect(fromMinor(-5n)).toBe('-0.005');
  });

  it('rounds half up like brick/math and scales decimals', () => {
    expect(divideHalfUp(5n, 2n)).toBe(3n);
    expect(divideHalfUp(-5n, 2n)).toBe(-3n);
    expect(divideHalfUp(4n, 3n)).toBe(1n);
    expect(toScaled('1.25', 2)).toBe(125n);
    expect(toScaled('2', 2)).toBe(200n);
    expect(toScaled('1.255', 2)).toBeNull();
  });
});
