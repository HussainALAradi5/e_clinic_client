import { LeaveType } from '@interfaces/hr/leave.interface';

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
