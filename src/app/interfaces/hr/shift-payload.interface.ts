import { ShiftType } from '@enums/hr/shift-type.enum';

/** POST / PUT /hr/shifts. */
export interface ShiftPayload {
  name: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  latestStart?: string | null;
  requiredMinutes?: number | null;
  notes?: string | null;
}
