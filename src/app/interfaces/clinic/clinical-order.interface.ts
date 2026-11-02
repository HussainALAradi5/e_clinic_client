import { AppointmentStatus } from '@enums/clinic/appointment-status.enum';
import { ClinicalOrderType } from '@enums/clinic/clinical-order-type.enum';
import { ConsentType } from '@enums/clinic/consent-type.enum';
import { TreatmentPriority } from '@enums/clinic/treatment-priority.enum';
import { Gender } from '@enums/shared/gender.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { Attachment } from '@interfaces/attachment/attachment.interface';
import { InvoiceRef } from '@interfaces/billing/invoice-ref.interface';
import { PersonRef } from '@interfaces/clinic/person-ref.interface';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { Versioned } from '@interfaces/common/versioned.interface';
import { Money } from '@interfaces/common/money.interface';

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
