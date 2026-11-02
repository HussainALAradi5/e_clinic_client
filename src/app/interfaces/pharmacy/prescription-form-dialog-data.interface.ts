import { PatientSummary } from '@interfaces/common/summary.interface';
import { Prescription } from '@interfaces/pharmacy/prescription.interface';

/**
 * Write a prescription (preset patient / visit) or edit a pending one; closes with the saved prescription.
 * `doctorPicker` lets non-doctors with the right name the prescribing doctor.
 */
export interface PrescriptionFormDialogData {
  prescription: Prescription | null;
  patient: PatientSummary | null;
  appointmentId?: string | null;
  treatmentId?: string | null;
}
