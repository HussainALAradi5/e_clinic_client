import { Currency } from '@enums/shared/currency.enum';

/** Mirror of MoneyCast / MoneyHelper::toApi(): `{ amount: "25.500", currency: "BHD" }` — never a JS number. */
export interface Money {
  amount: string;
  currency: Currency;
}
