import { Attendance } from '@interfaces/hr/attendance.interface';
import { StaffRequestType } from '@enums/hr/staff-request-type.enum';

export interface StaffRequestDialogData {
  day: Attendance;
  type: StaffRequestType;
}
