import { Money } from '@interfaces/common/money.interface';

/** One employee's month as payroll sees it. */
export interface AttendanceSummary {
  workingDays: number;
  presentDays: string;
  absentDays: string;
  paidLeaveDays: string;
  unpaidLeaveDays: string;
  lateMinutes: number;
  approvedOvertimeMinutes: number;
  pendingOvertimeMinutes: number;
  /** Deducted from pay while late excuses are on. */
  unexcusedLateMinutes: number;
  approvedOvertimeAmount: Money;
}
