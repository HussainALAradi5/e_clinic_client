import { TreatmentPriority } from '@enums/clinic/treatment-priority.enum';
import { TreatmentType } from '@enums/clinic/treatment-type.enum';
import { SessionBookingPayload } from '@interfaces/clinic/session-booking-payload.interface';

/** POST /treatments (create) and PUT /treatments/{id} (edit: patient, doctor, visit and priority stay). */
export interface TreatmentPayload {
  version?: number;
  patientId?: string;
  doctorId?: string;
  appointmentId?: string | null;
  type?: TreatmentType;
  billableServiceId?: string | null;
  title?: string;
  diagnosis?: string | null;
  plan?: string | null;
  priority?: TreatmentPriority;
  plannedSessions?: number;
  sessionDurationMinutes?: number | null;
  sessions?: SessionBookingPayload[];
  overridePriorityDeadline?: boolean;
}
