import { AttendanceStatus } from '@enums/hr/attendance-status.enum';
import { StaffRequestType } from '@enums/hr/staff-request-type.enum';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { Money } from '@interfaces/common/money.interface';
import { EmployeeSummary } from '@interfaces/common/employee-summary.interface';
import { UserSummary } from '@interfaces/common/user-summary.interface';

/** Mirror of StaffRequestResource — a late excuse or overtime request about one attendance day. */
export interface StaffRequest {
  id: string;
  code: string;
  type: StaffRequestType;
  status: ApprovalStatus;
  employeeId: string;
  employee?: EmployeeSummary;
  attendance?: {
    id: string;
    date: string;
    checkInAt: string | null;
    checkOutAt: string | null;
    workedMinutes: number;
    status: AttendanceStatus;
  };
  /** Late or overtime minutes: live while pending, as decided afterwards. */
  minutes: number;
  /** Snapshot: the minutes and, for overtime, the rate per hour and amount; for lateness, what it would cost. */
  details: { minutes: number; rate?: string; amount?: Money } | null;
  reason: string | null;
  reviewedBy: UserSummary | null;
  reviewedAt: string | null;
  reviewReason: string | null;
  createdAt: string | null;
}
