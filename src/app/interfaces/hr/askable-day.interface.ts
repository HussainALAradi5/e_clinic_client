import { StaffRequestType } from '@enums/hr/staff-request-type.enum';
import { Attendance } from '@interfaces/hr/attendance.interface';

/** GET hr/requests/askable — a recent day of mine and the kinds of request it still allows. */
export interface AskableDay {
  attendance: Attendance;
  types: StaffRequestType[];
}
