import { Treatment } from '@interfaces/clinic/treatment.interface';

/** Book the next session, change priority, … of one plan. */
export interface TreatmentDialogData {
  treatment: Treatment;
}
