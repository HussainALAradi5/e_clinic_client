/** `employeeId` only when HR records leave for someone else. */
export interface LeaveRequestPayload {
  employeeId?: string | null;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  reason: string | null;
}
