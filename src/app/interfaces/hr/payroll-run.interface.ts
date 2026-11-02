import { PayrollStatus } from '@enums/hr/payroll-status.enum';
import { Money } from '@interfaces/common/money.interface';
import { UserSummary } from '@interfaces/common/user-summary.interface';
import { Payslip } from '@interfaces/hr/payslip.interface';

/** Mirror of PayrollRunResource — one month; payslips on the detail view. */
export interface PayrollRun {
  id: string;
  code: string;
  periodYear: number;
  periodMonth: number;
  periodStart: string;
  periodEnd: string;
  status: PayrollStatus;
  totalGross: Money;
  totalDeductions: Money;
  totalNet: Money;
  employeeCount: number;
  calculatedAt: string | null;
  calculatedBy?: UserSummary | null;
  approvedAt: string | null;
  approvedBy?: UserSummary | null;
  paidOn: string | null;
  paymentReference: string | null;
  accrualJournalEntryId: string | null;
  paymentJournalEntryId: string | null;
  cancellationReason: string | null;
  payslips?: Payslip[];
  createdAt: string | null;
}
