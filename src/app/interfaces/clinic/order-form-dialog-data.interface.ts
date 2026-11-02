import { Patient } from '@interfaces/clinic/patient.interface';

/** New imaging / lab / ECG order or referral for a patient (from a visit or treatment when given). */
export interface OrderFormDialogData {
  patient: Pick<Patient, 'id' | 'fullName'>;
  appointmentId?: string | null;
  treatmentId?: string | null;
}
