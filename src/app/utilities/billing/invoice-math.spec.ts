import { discountPercent, invoiceAmounts, lineAmounts } from './invoice-math';
import { DiscountType } from '@enums/billing/discount-type.enum';

const line = (over: Partial<Parameters<typeof lineAmounts>[0]> = {}) => ({
  quantity: '1',
  unitPrice: '15.000',
  discountType: null,
  discountValue: '0',
  taxRate: '0',
  ...over,
});

describe('invoice math', () => {
  it('prices a line like InvoiceCalculator with half-up rounding', () => {
    expect(
      lineAmounts(line({ discountType: DiscountType.Percentage, discountValue: '10' })),
    ).toEqual({
      gross: 15000n,
      discount: 1500n,
      tax: 0n,
      total: 13500n,
    });
    // 2.5 × 0.333 = 0.8325 → 0.833; VAT 10% of 0.833 = 0.0833 → 0.083.
    expect(lineAmounts(line({ quantity: '2.5', unitPrice: '0.333', taxRate: '10' }))?.total).toBe(
      916n,
    );
  });

  it('caps a fixed discount at the gross amount and rejects invalid numbers', () => {
    expect(
      lineAmounts(line({ discountType: DiscountType.Fixed, discountValue: '20' }))?.total,
    ).toBe(0n);
    expect(lineAmounts(line({ quantity: '0' }))).toBeNull();
    expect(lineAmounts(line({ unitPrice: 'abc' }))).toBeNull();
  });

  it('sums header totals and reports the discount percent', () => {
    const totals = invoiceAmounts([
      line({ discountType: DiscountType.Percentage, discountValue: '10' }),
      line({ quantity: '2', unitPrice: '1.500' }),
      line({ unitPrice: '' }),
    ]);
    expect(totals).toEqual({
      subtotal: '18.000',
      discount: '1.500',
      tax: '0.000',
      total: '16.500',
    });
    expect(
      discountPercent(lineAmounts(line({ discountType: DiscountType.Fixed, discountValue: '3' }))),
    ).toBe(20);
  });
});
