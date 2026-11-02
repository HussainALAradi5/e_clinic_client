import { GenericStatus } from '@enums/shared/generic-status.enum';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { PatientSummary } from '@interfaces/common/summary.interface';
import { UserSummary } from '@interfaces/common/user-summary.interface';
import { Dispensation } from '@interfaces/pharmacy/dispensation.interface';
import { PrescriptionItem } from '@interfaces/pharmacy/prescription-item.interface';

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
