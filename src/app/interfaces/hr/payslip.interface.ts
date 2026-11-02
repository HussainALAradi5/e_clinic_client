import { PayrollStatus } from '@enums/hr/payroll-status.enum';
import { Money } from '@interfaces/common/money.interface';
import { EmployeeSummary } from '@interfaces/common/employee-summary.interface';
import { PayslipItem } from '@interfaces/hr/payroll.interface';

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
