import { Shift, ShiftPayload } from '@interfaces/hr/shift.interface';

export interface ShiftFormDialogData {
  shift: Shift | null;
  save: (payload: ShiftPayload) => Promise<Shift>;
}
