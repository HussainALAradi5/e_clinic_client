import { FiscalStatus } from '@shared/enums/accounting/fiscal-status.enum';

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

/** Mirror of FiscalYearResource. */
export interface FiscalYear {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  status: FiscalStatus;
  closingJournalEntryId: string | null;
  closedAt: string | null;
  periods?: FiscalPeriod[];
  createdAt: string;
}

export interface FiscalYearPayload {
  name: string;
  startDate: string;
  endDate: string;
  withAdjustmentPeriod: boolean;
}
