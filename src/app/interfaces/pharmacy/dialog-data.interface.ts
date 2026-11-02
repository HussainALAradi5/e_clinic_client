import { PatientSummary } from '@interfaces/common/summary.interface';
import { MedicationBatch } from '@interfaces/pharmacy/inventory.interface';
import { Medication } from '@interfaces/pharmacy/medication.interface';
import { Prescription } from '@interfaces/pharmacy/prescription.interface';

/** New medication or edit; closes with the saved medication. */
export interface MedicationFormDialogData {
  medication: Medication | null;
}

/** Goods receipt, optionally for a preset medication; closes with the received lot. */
export interface ReceiveStockDialogData {
  medication: Medication | null;
}

/** Count correction of one lot; closes with the ledger row. */
export interface AdjustStockDialogData {
  batch: MedicationBatch;
}

export interface TransferStockDialogData {
  batch: MedicationBatch;
}

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

/** Medicines given during a running session; closes with the recorded dispensation. */
export interface AdministerDialogData {
  appointmentId: string;
  patient: PatientSummary | null;
}
