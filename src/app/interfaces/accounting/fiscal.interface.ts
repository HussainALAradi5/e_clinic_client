import { FiscalStatus } from '@enums/accounting/fiscal-status.enum';

/** Mirror of FiscalPeriodResource — a month (or the one-day adjustment period 13). */
export interface FiscalPeriod {
  id: string;
  code: string;
  fiscalYearId: string;
  periodNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  status: FiscalStatus;
  closedAt: string | null;
}
