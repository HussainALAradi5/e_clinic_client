import { Money } from '@interfaces/common/money.interface';
import { toMinor } from '@utilities/money';

/** A figure as a plain number (money in fils), for comparing two months. */
export function figureValue(value: Money | number): number {
  return typeof value === 'number' ? value : Number(toMinor(value.amount) ?? 0n);
}

/** Change from the month before in percent (rounded); null when there is nothing to compare with. */
export function monthChange(current: Money | number, previous: Money | number): number | null {
  const now = figureValue(current);
  const before = figureValue(previous);
  if (before === 0) return now === 0 ? 0 : null;
  return Math.round(((now - before) / Math.abs(before)) * 100);
}
