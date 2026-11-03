import { AppointmentSource } from '@enums/clinic/appointment-source.enum';
import { AppointmentStatus } from '@enums/clinic/appointment-status.enum';
import { AppointmentType } from '@enums/clinic/appointment-type.enum';
import { CancelledBy } from '@enums/clinic/cancelled-by.enum';
import { VisitTiming } from '@enums/clinic/visit-timing.enum';
import { Gender } from '@enums/shared/gender.enum';
import { InvoiceRef } from '@interfaces/billing/invoice-ref.interface';
import { Versioned } from '@interfaces/common/versioned.interface';
import { Money } from '@interfaces/common/money.interface';

/** Mirror of AppointmentResource. `allowedTransitions` drives the action buttons. */
export interface Appointment extends Versioned {
  id: string;
  code: string;
  patientId: string;
  patient?: {
    id: string;
    code: string;
    fullName: string;
    phone: string;
    gender: Gender;
    dateOfBirth: string;
  };
  providerId: string;
  provider?: { id: string; fullName: string; jobTitle: string };
  type: AppointmentType;
  treatmentId: string | null;
  sessionNumber: number | null;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  startsAt: string;
  endsAt: string;
  roomId: string | null;
  room?: { id: string; code: string; name: string } | null;
  billableService?: { id: string; name: string; price: Money } | null;
  status: AppointmentStatus;
  /** Coming, today, past or missed (worked out by the server from the date and the status). */
  timing: VisitTiming;
  allowedTransitions: AppointmentStatus[];
  isAttended: boolean;
  source: AppointmentSource;
  reason: string | null;
  notes: string | null;
  /** The live invoice this visit is billed on (detail only). */
  invoice?: InvoiceRef | null;
  rescheduledFromId: string | null;
  rescheduledFrom?: { id: string; code: string; scheduledDate: string; startTime: string } | null;
  cancelledBy: CancelledBy | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  checkedInAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Complete response only. */
  followUpSuggestedDate?: string | null;
}
