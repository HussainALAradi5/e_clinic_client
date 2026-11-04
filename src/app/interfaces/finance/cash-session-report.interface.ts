import { PaymentMethod } from '@enums/shared/payment-method.enum';
import { Money } from '@interfaces/common/money.interface';

/** Z-report figures: expected cash and how it was built, plus everything the cashier took per method. */
export interface CashSessionReport {
  openingFloat: Money;
  cashIn: Money;
  cashRefunds: Money;
  cashExpenses: Money;
  /** Cash patients left on their balance during the session. */
  balanceDeposits: Money;
  /** Cash paid back from patient balances during the session. */
  balancePaybacks: Money;
  expected: Money;
  byMethod: { method: PaymentMethod; total: Money }[];
  payments: number;
  refunds: number;
  expenses: number;
}
