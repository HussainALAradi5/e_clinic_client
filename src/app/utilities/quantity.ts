import { toScaled } from '@utilities/money';

/** Quantities are numeric(10,2) on the server: compared and summed exactly here, as hundredths in a bigint. */
const SCALE = 2;

/** '21.00' → '21', '2.50' → '2.5', '-3.00' → '-3'. */
export function formatQty(value: string | null | undefined): string {
  const scaled = toScaled(value, SCALE);
  return scaled === null ? (value ?? '') : fromHundredths(scaled);
}

/** Positive quantity with at most two decimals. */
export function isPositiveQty(value: string | null | undefined): boolean {
  const scaled = toScaled(value, SCALE);
  return scaled !== null && scaled > 0n;
}

/** −1 / 0 / 1; invalid values count as zero. */
export function compareQty(a: string | null | undefined, b: string | null | undefined): number {
  const x = toScaled(a, SCALE) ?? 0n;
  const y = toScaled(b, SCALE) ?? 0n;
  return x === y ? 0 : x < y ? -1 : 1;
}

/** Exact sum, formatted. */
export function sumQty(values: readonly (string | null | undefined)[]): string {
  return fromHundredths(values.reduce((sum, v) => sum + (toScaled(v, SCALE) ?? 0n), 0n));
}

/** `part` as a share of `total`, 0–100 (progress bars: handed over of prescribed, on hand of reorder level). */
export function percentOf(
  part: string | null | undefined,
  total: string | null | undefined,
): number {
  const whole = toScaled(total, SCALE) ?? 0n;
  const share = toScaled(part ?? '0', SCALE) ?? 0n;
  if (whole <= 0n) {
    return 0;
  }
  return Math.max(0, Math.min(100, Number((share * 100n) / whole)));
}

function fromHundredths(value: bigint): string {
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const fraction = (abs % 100n).toString().padStart(SCALE, '0').replace(/0+$/, '');
  return `${negative ? '-' : ''}${abs / 100n}${fraction ? '.' + fraction : ''}`;
}
