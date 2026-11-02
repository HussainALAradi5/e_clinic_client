import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { EmployeeSummary } from '@interfaces/common/employee-summary.interface';
import { UserSummary } from '@interfaces/common/user-summary.interface';
import { LeaveType } from '@interfaces/hr/leave.interface';

/** Mirror of LeaveRequestResource — draft (certificate missing) → pending → approved / rejected; cancelled. */
export interface LeaveRequest extends GenericEntity {
  employeeId: string;
  employee?: EmployeeSummary;
  leaveTypeId: string;
  leaveType?: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: string;
  isHalfDay: boolean;
  reason: string | null;
  status: ApprovalStatus;
  reviewedBy?: UserSummary | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  attachmentsCount?: number;
}
