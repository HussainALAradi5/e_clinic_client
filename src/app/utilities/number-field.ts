import { NumberFieldOptions } from '@interfaces/ui/number-field-options.interface';

/** Keeps digits and, when decimals are allowed, one point with at most `decimals` places. Never a minus sign. */
export function sanitizeNumber(raw: string, decimals: number): string {
  const cleaned = raw.replace(/[^\d.]/g, '');
  if (decimals === 0) {
    return cleaned.replace(/\./g, '');
  }
  const [whole, ...rest] = cleaned.split('.');
  return rest.length ? `${whole}.${rest.join('').slice(0, decimals)}` : whole;
}

/** The value inside its limits, written with exactly `decimals` places. Empty stays empty. */
export function normaliseNumber(value: string | null, options: NumberFieldOptions): string | null {
  if (value === null || value === '' || Number.isNaN(Number(value))) {
    return null;
  }
  return clampNumber(Number(value), options).toFixed(options.decimals);
}

/** One step up or down, in whole units of the last decimal so 0.1 + 0.2 stays exact. */
export function stepNumber(
  current: string | null,
  direction: 1 | -1,
  options: NumberFieldOptions,
): string {
  const factor = 10 ** options.decimals;
  const base = current ? Math.round(Number(current) * factor) : Math.round(options.min * factor);
  const next = (base + direction * Math.round(options.step * factor)) / factor;
  return clampNumber(next, options).toFixed(options.decimals);
}

function clampNumber(value: number, { min, max }: NumberFieldOptions): number {
  return Math.min(Math.max(value, min), max ?? Number.POSITIVE_INFINITY);
}
