import { InvoiceRef } from '@shared/interfaces/billing/invoice.interface';
import { AppointmentSource } from '@shared/enums/clinic/appointment-source.enum';
import { AppointmentStatus } from '@shared/enums/clinic/appointment-status.enum';
import { AppointmentType } from '@shared/enums/clinic/appointment-type.enum';
import { CancelledBy } from '@shared/enums/clinic/cancelled-by.enum';
import { Gender } from '@shared/enums/shared/gender.enum';
import { Versioned } from '@shared/interfaces/common/generic-entity.interface';
import { Money } from '@shared/interfaces/common/money.interface';

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

/** POST /appointments (sent with an Idempotency-Key). */
export interface BookAppointmentPayload {
  patientId: string;
  providerId: string;
  type: AppointmentType;
  scheduledDate: string;
  startTime: string;
  endTime?: string | null;
  source: AppointmentSource;
  roomId?: string | null;
  reason?: string | null;
  notes?: string | null;
}

/** GET /appointments/available-slots item. */
export interface Slot {
  start: string;
  end: string;
  startTime: string;
  endTime: string;
}

/** PATCH /appointments/{id}/cancel. */
export interface CancelAppointmentPayload {
  reason: string;
  cancelledBy: CancelledBy;
}

/** POST /appointments/{id}/reschedule. */
export interface ReschedulePayload {
  scheduledDate: string;
  startTime: string;
  providerId?: string | null;
  roomId?: string | null;
}

/** PATCH /appointments/{id}/complete. */
export interface CompleteAppointmentPayload {
  billableServiceIds?: string[];
  followUpInDays?: number | null;
}
