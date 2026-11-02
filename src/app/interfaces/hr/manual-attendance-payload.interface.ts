import { AttendanceStatus } from '@enums/hr/attendance-status.enum';

/** HR correction: times (clinic time, HH:mm) or, without a check-in, what the day was. */
export interface ManualAttendancePayload {
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus | null;
  reason: string;
}
