import { Patient } from '@interfaces/clinic/patient.interface';
import { Treatment } from '@interfaces/clinic/treatment.interface';

/** Prescribe a plan (optionally from a visit) or edit one. */
export interface TreatmentFormDialogData {
  treatment: Treatment | null;
  patient?: Patient | null;
  appointmentId?: string | null;
  doctorId?: string | null;
}
