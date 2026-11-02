import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { EmployeeSummary, UserSummary } from '@interfaces/common/summary.interface';

/** Mirror of LeaveTypeResource — `isLimited`: paid with a yearly quota (checked against the balance). */
export interface LeaveType {
  id: string;
  code: string;
  name: string;
  nameAr: string | null;
  annualQuotaDays: string;
  isPaid: boolean;
  isLimited: boolean;
  requiresAttachment: boolean;
  maxCarryForwardDays: string;
  minNoticeDays: number;
  isArchived: boolean;
}

export interface LeaveTypePayload {
  code: string;
  name: string;
  nameAr: string | null;
  annualQuotaDays: number;
  isPaid: boolean;
  requiresAttachment: boolean;
  maxCarryForwardDays: number;
  minNoticeDays: number;
}

/** Mirror of LeaveBalanceResource — `remainingDays` is null for types without a limit. */
export interface LeaveBalance {
  id: string;
  year: number;
  leaveType: LeaveType;
  entitledDays: string;
  carriedForwardDays: string;
  usedDays: string;
  pendingDays: string;
  remainingDays: string | null;
}

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

/** `employeeId` only when HR records leave for someone else. */
export interface LeaveRequestPayload {
  employeeId?: string | null;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  reason: string | null;
}
