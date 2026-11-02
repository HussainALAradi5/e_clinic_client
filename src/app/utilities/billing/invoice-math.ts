import { DiscountType } from '@enums/billing/discount-type.enum';
import { divideHalfUp, fromMinor, toMinor, toScaled } from '@utilities/money';
import { InvoiceAmounts } from '@interfaces/billing/invoice-amounts.interface';
import { LineAmounts } from '@interfaces/billing/line-amounts.interface';
import { LineDraft } from '@interfaces/billing/invoice-math.interface';

/**
 * Preview of InvoiceCalculator::line() in fils (HALF_UP, 3 decimals): gross = qty × price; discount fixed or %,
 * capped at gross; VAT on the discounted amount. The server re-prices on save — this only keeps the screen honest.
 * Null when a number is not valid yet.
 */
export function lineAmounts(line: LineDraft): LineAmounts | null {
  const quantity = toScaled(line.quantity, 2);
  const price = toMinor(line.unitPrice);
  const rate = toScaled(line.taxRate || '0', 2);
  if (quantity === null || quantity <= 0n || price === null || rate === null) {
    return null;
  }
  const gross = divideHalfUp(quantity * price, 100n);
  let discount = 0n;
  if (line.discountType === DiscountType.Fixed) {
    const value = toMinor(line.discountValue || '0');
    if (value === null) return null;
    discount = value;
  } else if (line.discountType === DiscountType.Percentage) {
    const percent = toScaled(line.discountValue || '0', 2);
    if (percent === null) return null;
    discount = divideHalfUp(gross * percent, 10000n);
  }
  if (discount > gross) discount = gross;
  if (discount < 0n) discount = 0n;
  const tax = divideHalfUp((gross - discount) * rate, 10000n);
  return { gross, discount, tax, total: gross - discount + tax };
}

/** Header totals of the lines that can be priced (InvoiceCalculator::refresh()). */
export function invoiceAmounts(lines: LineDraft[]): InvoiceAmounts {
  const sum = { gross: 0n, discount: 0n, tax: 0n, total: 0n };
  for (const amounts of lines.map(lineAmounts)) {
    if (!amounts) continue;
    sum.gross += amounts.gross;
    sum.discount += amounts.discount;
    sum.tax += amounts.tax;
    sum.total += amounts.total;
  }
  return {
    subtotal: fromMinor(sum.gross),
    discount: fromMinor(sum.discount),
    tax: fromMinor(sum.tax),
    total: fromMinor(sum.total),
  };
}

/** Discount as a percent of the line's gross (for the role limit hint), 0 when nothing to discount. */
export function discountPercent(amounts: LineAmounts | null): number {
  if (!amounts || amounts.gross === 0n) return 0;
  return Number((amounts.discount * 10000n) / amounts.gross) / 100;
}
