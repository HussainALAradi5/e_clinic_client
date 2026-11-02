import { DispensationKind } from '@enums/pharmacy/dispensation-kind.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { InvoiceRef } from '@interfaces/billing/invoice-ref.interface';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { PatientSummary } from '@interfaces/common/summary.interface';
import { UserSummary } from '@interfaces/common/user-summary.interface';
import { DispensationItem } from '@interfaces/pharmacy/dispensation-item.interface';

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
