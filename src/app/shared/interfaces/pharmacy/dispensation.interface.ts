import { DispensationKind } from '@shared/enums/pharmacy/dispensation-kind.enum';
import { MedicationRoute } from '@shared/enums/pharmacy/medication-route.enum';
import { GenericStatus } from '@shared/enums/shared/generic-status.enum';
import { InvoiceRef } from '@shared/interfaces/billing/invoice.interface';
import { GenericEntity } from '@shared/interfaces/common/generic-entity.interface';
import { Money } from '@shared/interfaces/common/money.interface';
import { PatientSummary, UserSummary } from '@shared/interfaces/common/summary.interface';
import { MedicationRef } from '@shared/interfaces/pharmacy/medication.interface';
import { Prescription } from '@shared/interfaces/pharmacy/prescription.interface';

/** One lot's share of a dispensed medicine, at the price-list price. */
export interface DispensationItem {
  id: string;
  prescriptionItemId: string | null;
  medicationId: string;
  medication: MedicationRef;
  batch: { id: string; code: string; batchNumber: string; expiryDate: string } | null;
  quantity: string;
  unitPrice: Money;
  lineTotal: Money;
  route: MedicationRoute | null;
  dose: string | null;
}

/** Mirror of DispensationResource — `completed`, or `cancelled` when returned to stock the same day. */
export interface Dispensation extends GenericEntity {
  kind: DispensationKind;
  status: GenericStatus;
  prescriptionId: string | null;
  prescription?: { id: string; code: string } | null;
  appointmentId: string | null;
  appointment?: { id: string; code: string } | null;
  patientId: string;
  patient?: PatientSummary;
  dispensedBy?: UserSummary | null;
  witness?: UserSummary | null;
  dispensedAt: string;
  notes: string | null;
  cancellationReason: string | null;
  journalEntryId: string | null;
  reversalJournalEntryId: string | null;
  invoice?: InvoiceRef | null;
  items?: DispensationItem[];
}

export interface DispenseItemPayload {
  medicationId: string;
  quantity: string;
  prescriptionItemId?: string | null;
  batchId?: string | null;
}

/** Pharmacy hand-over: against a prescription or over the counter. */
export interface DispensePayload {
  patientId: string;
  prescriptionId?: string | null;
  items: DispenseItemPayload[];
  witnessId?: string | null;
  notes?: string | null;
}

export interface AdministerItemPayload {
  medicationId: string;
  quantity: string;
  route: MedicationRoute;
  dose?: string | null;
  batchId?: string | null;
}

/** Medicines given during a checked-in / in-progress session. */
export interface AdministerPayload {
  items: AdministerItemPayload[];
  witnessId?: string | null;
  notes?: string | null;
}

/** `GET appointments/{id}/medications` — prescribed there, and given / handed over. */
export interface AppointmentMedicines {
  prescriptions: Prescription[];
  dispensations: Dispensation[];
}
