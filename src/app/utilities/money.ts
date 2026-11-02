import { MONEY_DECIMALS, MONEY_PATTERN } from '@constants/limits.constants';
import { Currency } from '@enums/shared/currency.enum';
import { Money } from '@interfaces/common/money.interface';

/** Normalises user input to a 3-decimal string without floating point arithmetic ('25.5' → '25.500'). */
export function normaliseAmount(input: string | number): string | null {
  const value = String(input).trim().replace(/,/g, '');
  if (!MONEY_PATTERN.test(value)) {
    return null;
  }
  const [whole, fraction = ''] = value.split('.');
  return `${whole}.${fraction.padEnd(MONEY_DECIMALS, '0')}`;
}

export function money(amount: string, currency: Currency = Currency.BHD): Money {
  return { amount: normaliseAmount(amount) ?? amount, currency };
}

/** 'BHD 25.500' (MoneyHelper::format). */
export function formatMoney(value: Money | null | undefined): string {
  if (!value) {
    return '';
  }
  const [whole, fraction] = (normaliseAmount(value.amount) ?? value.amount).split('.');
  const sign = whole.startsWith('-') ? '-' : '';
  const grouped = whole.replace('-', '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${value.currency} ${sign}${grouped}.${fraction}`;
}

/**
 * Fils (1/1000 BHD) as a bigint, for exact client-side sums and previews ('25.500' → 25500n). Null when not an amount.
 */
export function toMinor(amount: string | null | undefined): bigint | null {
  const normalised = amount ? normaliseAmount(amount) : null;
  if (normalised === null) {
    return null;
  }
  const negative = normalised.startsWith('-');
  const [whole, fraction] = normalised.replace('-', '').split('.');
  const minor = BigInt(whole) * 10n ** BigInt(MONEY_DECIMALS) + BigInt(fraction);
  return negative ? -minor : minor;
}

/** 25500n → '25.500'. */
export function fromMinor(minor: bigint): string {
  const negative = minor < 0n;
  const abs = negative ? -minor : minor;
  const scale = 10n ** BigInt(MONEY_DECIMALS);
  const fraction = (abs % scale).toString().padStart(MONEY_DECIMALS, '0');
  return `${negative ? '-' : ''}${abs / scale}.${fraction}`;
}

/** Rounds numerator / denominator half away from zero (brick/math HALF_UP). */
export function divideHalfUp(numerator: bigint, denominator: bigint): bigint {
  const negative = numerator < 0n !== denominator < 0n;
  const n = numerator < 0n ? -numerator : numerator;
  const d = denominator < 0n ? -denominator : denominator;
  const rounded = (n * 2n + d) / (d * 2n);
  return negative ? -rounded : rounded;
}

/**
 * A decimal string as an integer scaled by 10^scale ('1.25', 2 → 125n). Null when it has more decimals than `scale`.
 */
export function toScaled(value: string | number | null | undefined, scale: number): bigint | null {
  const text = String(value ?? '').trim();
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(text);
  if (!match || (match[3]?.length ?? 0) > scale) {
    return null;
  }
  const scaled =
    BigInt(match[2]) * 10n ** BigInt(scale) + BigInt((match[3] ?? '').padEnd(scale, '0') || '0');
  return match[1] ? -scaled : scaled;
}

/** 'BHD 1,250.500' for a bare amount in the clinic currency. */
export function formatAmount(amount: string | bigint): string {
  return formatMoney({
    amount: typeof amount === 'bigint' ? fromMinor(amount) : amount,
    currency: Currency.BHD,
  });
}
