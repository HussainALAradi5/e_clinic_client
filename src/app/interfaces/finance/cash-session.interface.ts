import { CashSessionStatus } from '@enums/finance/cash-session-status.enum';
import { PaymentMethod } from '@enums/shared/payment-method.enum';
import { Money } from '@interfaces/common/money.interface';
import { UserSummary } from '@interfaces/common/summary.interface';

/** One note or coin of the count: face value ('20.000') and how many. */
export interface Denomination {
  value: string;
  count: number;
}

/** Z-report figures: expected cash and how it was built, plus everything the cashier took per method. */
export interface CashSessionReport {
  openingFloat: Money;
  cashIn: Money;
  cashRefunds: Money;
  cashExpenses: Money;
  expected: Money;
  byMethod: { method: PaymentMethod; total: Money }[];
  payments: number;
  refunds: number;
  expenses: number;
}

/** Mirror of CashSessionResource — one cashier's drawer shift. */
export interface CashSession {
  id: string;
  code: string;
  cashierId: string;
  cashier?: UserSummary | null;
  openedAt: string;
  openingFloat: Money;
  expectedClosing: Money | null;
  countedClosing: Money | null;
  difference: Money | null;
  denominations: Denomination[] | null;
  status: CashSessionStatus;
  closedAt: string | null;
  approvedBy?: UserSummary | null;
  depositAmount: Money | null;
  depositedAt: string | null;
  depositReference: string | null;
  notes: string | null;
  report?: CashSessionReport;
  createdAt: string;
}

export interface CloseSessionPayload {
  countedClosing: string;
  denominations?: Denomination[] | null;
  notes?: string | null;
}

export interface DepositPayload {
  date: string;
  reference: string;
  amount: string;
}
