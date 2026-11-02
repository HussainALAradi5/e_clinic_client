import { ShiftType } from '@enums/hr/shift-type.enum';
import { Attendance } from '@interfaces/hr/attendance.interface';

/** The signed-in employee's day and shift (check-in card). */
export interface AttendanceToday {
  attendance: Attendance | null;
  /** Late after `start`; the shift's code / name / type when the employee is on one. */
  shift: {
    start: string;
    end: string;
    code: string | null;
    name: string | null;
    type: ShiftType | null;
  };
}
