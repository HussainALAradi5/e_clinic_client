import { Specialty } from '@interfaces/clinic/specialty.interface';
import { SpecialtyPayload } from '@interfaces/clinic/specialty-payload.interface';

/** New or edited specialty. */
export interface SpecialtyFormDialogData {
  specialty: Specialty | null;
  save: (payload: SpecialtyPayload) => Promise<Specialty>;
}
