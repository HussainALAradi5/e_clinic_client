import { StaffRequestType } from '@enums/hr/staff-request-type.enum';

export interface StaffRequestPayload {
  type: StaffRequestType;
  attendanceId: string;
  reason: string | null;
}
