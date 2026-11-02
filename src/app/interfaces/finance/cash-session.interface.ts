import { CashSessionStatus } from '@enums/finance/cash-session-status.enum';
import { Money } from '@interfaces/common/money.interface';
import { UserSummary } from '@interfaces/common/user-summary.interface';
import { CashSessionReport } from '@interfaces/finance/cash-session-report.interface';
import { Denomination } from '@interfaces/finance/denomination.interface';

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
