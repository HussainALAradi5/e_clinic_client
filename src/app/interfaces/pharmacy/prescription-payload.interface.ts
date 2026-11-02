import { PrescriptionItemPayload } from '@interfaces/pharmacy/prescription-item-payload.interface';

/** Overrides confirm a duplicate-therapy or allergy warning the prescriber has seen. */
export interface PrescriptionPayload {
  patientId: string;
  doctorId?: string | null;
  appointmentId?: string | null;
  treatmentId?: string | null;
  validUntil?: string | null;
  notes?: string | null;
  items: PrescriptionItemPayload[];
  overrideDuplicate?: boolean;
  overrideAllergy?: boolean;
}
