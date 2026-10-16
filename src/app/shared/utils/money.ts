import { MONEY_DECIMALS, MONEY_PATTERN } from '@shared/constants/limits.constants';
import { Currency } from '@shared/enums/shared/currency.enum';
import { Money } from '@shared/interfaces/common/money.interface';

/** Normalises user input to a 3-decimal string without floating point arithmetic ('25.5' → '25.500'). */
export function normaliseAmount(input: string): string | null {
  const value = input.trim().replace(/,/g, '');
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
