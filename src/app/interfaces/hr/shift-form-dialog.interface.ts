import { Shift } from '@interfaces/hr/shift.interface';
import { ShiftPayload } from '@interfaces/hr/shift-payload.interface';

export interface ShiftFormDialogData {
  shift: Shift | null;
  save: (payload: ShiftPayload) => Promise<Shift>;
}
