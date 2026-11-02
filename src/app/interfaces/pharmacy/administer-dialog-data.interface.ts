import { PatientSummary } from '@interfaces/common/summary.interface';

/** Medicines given during a running session; closes with the recorded dispensation. */
export interface AdministerDialogData {
  appointmentId: string;
  patient: PatientSummary | null;
}
