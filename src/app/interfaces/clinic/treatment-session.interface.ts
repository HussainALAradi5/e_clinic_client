import { AppointmentStatus } from '@enums/clinic/appointment-status.enum';

/** One session of a plan (GET /treatments/{id}/sessions). */
export interface TreatmentSession {
  id: string;
  code: string;
  sessionNumber: number;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  provider: { id: string; fullName: string };
  room: { id: string; code: string; name: string } | null;
  status: AppointmentStatus;
  allowedTransitions: AppointmentStatus[];
  isAttended: boolean;
  startsAt: string;
  hasNote: boolean;
  cancellationReason: string | null;
}
