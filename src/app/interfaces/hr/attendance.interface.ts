import { AttendanceSource } from '@enums/hr/attendance-source.enum';
import { AttendanceStatus } from '@enums/hr/attendance-status.enum';
import { ShiftType } from '@enums/hr/shift-type.enum';
import { Money } from '@interfaces/common/money.interface';
import { EmployeeSummary } from '@interfaces/common/employee-summary.interface';

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
