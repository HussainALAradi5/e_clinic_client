import { ClinicalOrderType } from '@enums/clinic/clinical-order-type.enum';
import { ConsentType } from '@enums/clinic/consent-type.enum';
import { TreatmentPriority } from '@enums/clinic/treatment-priority.enum';
import { AppointmentStatus } from '@enums/clinic/appointment-status.enum';
import { Gender } from '@enums/shared/gender.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { InvoiceRef } from '@interfaces/billing/invoice.interface';
import { Attachment } from '@interfaces/attachment/attachment.interface';
import { GenericEntity, Versioned } from '@interfaces/common/generic-entity.interface';
import { Money } from '@interfaces/common/money.interface';

interface PersonRef {
  id: string;
  fullName: string;
}

/** Mirror of ClinicalOrderResource. Notes, report and images only with `patients.view_medical`. */
export interface ClinicalOrder extends GenericEntity, Versioned {
  type: ClinicalOrderType;
  /** One line: service — body part, or "Referral to …". */
  description: string;
  patientId: string;
  patient?: { id: string; code: string; fullName: string; dateOfBirth: string; gender: Gender };
  orderedBy: string;
  orderingDoctor?: PersonRef | null;
  appointmentId: string | null;
  appointment?: { id: string; code: string } | null;
  treatmentId: string | null;
  treatment?: { id: string; code: string; title: string } | null;
  billableServiceId: string | null;
  billableService?: {
    id: string;
    code: string;
    name: string;
    price: Money;
    consentType: ConsentType | null;
  } | null;
  referredToDoctorId: string | null;
  referredToDoctor?: PersonRef | null;
  referredToSpecialtyId: string | null;
  referredToSpecialty?: { id: string; name: string } | null;
  referredToCompanyId: string | null;
  referredToCompany?: { id: string; name: string } | null;
  referralAppointmentId: string | null;
  referralAppointment?: {
    id: string;
    code: string;
    scheduledDate: string;
    startTime: string;
    status: AppointmentStatus;
  } | null;
  bodyPart: string | null;
  clinicalNotes?: string | null;
  priority: TreatmentPriority;
  status: GenericStatus;
  allowedTransitions: GenericStatus[];
  roomId: string | null;
  room?: { id: string; code: string; name: string } | null;
  performer?: PersonRef | null;
  startedAt: string | null;
  completedAt: string | null;
  report?: string | null;
  reporter?: PersonRef | null;
  isAbnormal: boolean | null;
  cancellationReason: string | null;
  /** The live invoice this order is billed on (detail only). */
  invoice?: InvoiceRef | null;
  attachments?: Attachment[];
}

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

/** PATCH /clinical-orders/{id}/complete. */
export interface OrderResultPayload {
  report: string;
  isAbnormal?: boolean | null;
  reportedBy?: string | null;
}
