import { MedicationRoute } from '@enums/pharmacy/medication-route.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { PatientSummary, UserSummary } from '@interfaces/common/summary.interface';
import { Dispensation } from '@interfaces/pharmacy/dispensation.interface';
import { MedicationRef } from '@interfaces/pharmacy/medication.interface';

/** A prescribed medicine; `dispensedQuantity` / `remainingQuantity` are computed on the detail view. */
export interface PrescriptionItem {
  id: string;
  medicationId: string;
  medication: MedicationRef;
  dose: string;
  frequency: string;
  route: MedicationRoute;
  durationDays: number;
  quantity: string;
  dispensedQuantity: string | null;
  remainingQuantity: string | null;
  instructions: string | null;
}

/** Mirror of PrescriptionResource — pending → in_progress (partly dispensed) → completed / cancelled. */
export interface Prescription extends GenericEntity {
  patientId: string;
  patient?: PatientSummary;
  doctorId: string;
  doctor?: UserSummary;
  appointmentId: string | null;
  appointment?: { id: string; code: string; scheduledDate: string } | null;
  treatmentId: string | null;
  treatment?: { id: string; code: string } | null;
  status: GenericStatus;
  validUntil: string;
  notes: string | null;
  cancellationReason: string | null;
  items?: PrescriptionItem[];
  dispensations?: Dispensation[];
}

export interface PrescriptionItemPayload {
  medicationId: string;
  dose: string;
  frequency: string;
  route: MedicationRoute;
  durationDays: number;
  quantity: string;
  instructions: string | null;
}

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
