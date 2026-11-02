import { FiscalStatus } from '@enums/accounting/fiscal-status.enum';
import { FiscalPeriod } from '@interfaces/accounting/fiscal.interface';

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
