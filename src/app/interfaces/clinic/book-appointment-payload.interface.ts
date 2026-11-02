import { AppointmentSource } from '@enums/clinic/appointment-source.enum';
import { AppointmentType } from '@enums/clinic/appointment-type.enum';

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
