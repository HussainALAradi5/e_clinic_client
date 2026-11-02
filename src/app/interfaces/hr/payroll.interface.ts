import { PayrollStatus } from '@enums/hr/payroll-status.enum';
import { PayslipItemType } from '@enums/hr/payslip-item-type.enum';
import { EmployeeSummary, UserSummary } from '@interfaces/common/summary.interface';
import { Money } from '@interfaces/common/money.interface';

/** A payslip line (positive amount; `isEarning` tells whether it adds or deducts). */
export interface PayslipItem {
  type: PayslipItemType;
  isEarning: boolean;
  name: string;
  amount: Money;
}

/** Mirror of PayslipResource — gross − deductions = net (never negative; a shortfall is carried forward). */
export interface Payslip {
  id: string;
  payrollRunId: string;
  run?: {
    id: string;
    code: string;
    status: PayrollStatus;
    periodStart: string;
    paidOn: string | null;
  };
  employee?: EmployeeSummary & {
    bankName: string | null;
    ibanLast4: string | null;
    socialInsuranceNumber: string | null;
  };
  department?: { id: string; name: string };
  basicSalary: Money;
  workingDays: number;
  presentDays: string;
  absentDays: string;
  paidLeaveDays: string;
  unpaidLeaveDays: string;
  overtimeMinutes: number;
  totalAllowances: Money;
  overtimeAmount: Money;
  grossSalary: Money;
  totalDeductions: Money;
  netSalary: Money;
  carriedForward: Money;
  items?: PayslipItem[];
}

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
