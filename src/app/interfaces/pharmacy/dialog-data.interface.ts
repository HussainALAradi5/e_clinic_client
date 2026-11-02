import { Medication } from '@interfaces/pharmacy/medication.interface';

/** New medication or edit; closes with the saved medication. */
export interface MedicationFormDialogData {
  medication: Medication | null;
}
