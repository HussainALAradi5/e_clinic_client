import { ClinicalOrderType } from '@enums/clinic/clinical-order-type.enum';
import { TreatmentPriority } from '@enums/clinic/treatment-priority.enum';

/** POST /clinical-orders and PUT /clinical-orders/{id}. */
export interface ClinicalOrderPayload {
  version?: number;
  type?: ClinicalOrderType;
  patientId?: string;
  orderedBy?: string | null;
  appointmentId?: string | null;
  treatmentId?: string | null;
  billableServiceId?: string | null;
  referredToDoctorId?: string | null;
  referredToSpecialtyId?: string | null;
  referredToCompanyId?: string | null;
  bodyPart?: string | null;
  clinicalNotes?: string | null;
  priority?: TreatmentPriority;
}
