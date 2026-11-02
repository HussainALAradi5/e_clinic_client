import { ShiftType } from '@shared/enums/hr/shift-type.enum';
import { AttendanceSource } from '@shared/enums/hr/attendance-source.enum';
import { AttendanceStatus } from '@shared/enums/hr/attendance-status.enum';
import { Money } from '@shared/interfaces/common/money.interface';
import { EmployeeSummary } from '@shared/interfaces/common/summary.interface';

/** Mirror of AttendanceResource — one employee's working day. */
export interface Attendance {
  /** The shift it was measured against (null: the employee's own hours). */
  shift?: {
    code: string;
    name: string;
    type: ShiftType;
    arriveBy: string;
    expectedEnd: string;
  } | null;
  id: string;
  employeeId: string;
  employee?: EmployeeSummary;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  workedMinutes: number;
  lateMinutes: number;
  overtimeMinutes: number;
  overtimeApproved: boolean;
  /** Priced when the overtime is approved (HR rate per hour, or hourly wage × 1.25). */
  overtimeAmount: Money | null;
  /** HR accepted the excuse: these late minutes are not deducted. */
  lateExcused: boolean;
  status: AttendanceStatus;
  source: AttendanceSource;
  notes: string | null;
  needsReview: boolean;
  isLocked: boolean;
  updatedAt: string | null;
}

/** The signed-in employee's day and shift (check-in card). */
export interface AttendanceToday {
  attendance: Attendance | null;
  /** Late after `start`; the shift's code / name / type when the employee is on one. */
  shift: {
    start: string;
    end: string;
    code: string | null;
    name: string | null;
    type: ShiftType | null;
  };
}

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

/** HR correction: times (clinic time, HH:mm) or, without a check-in, what the day was. */
export interface ManualAttendancePayload {
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus | null;
  reason: string;
}
