import { LeaveType } from '@interfaces/hr/leave.interface';

/** New leave type or edit. */
export interface LeaveTypeDialogData {
  type: LeaveType | null;
}
