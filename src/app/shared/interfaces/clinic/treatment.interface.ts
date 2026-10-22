import { AppointmentStatus } from '@shared/enums/clinic/appointment-status.enum';
import { TreatmentPriority } from '@shared/enums/clinic/treatment-priority.enum';
import { TreatmentType } from '@shared/enums/clinic/treatment-type.enum';
import { GenericStatus } from '@shared/enums/shared/generic-status.enum';
import { GenericEntity, Versioned } from '@shared/interfaces/common/generic-entity.interface';
import { Money } from '@shared/interfaces/common/money.interface';

/** Attendance and progress computed by the server from the session appointments. */
export interface TreatmentProgress {
  plannedSessions: number;
  attendedSessions: number;
  completedSessions: number;
  absentSessions: number;
  cancelledSessions: number;
  upcomingSessions: number;
  remainingSessions: number;
  /** % of held sessions attended; null before the first one. */
  attendanceRate: number | null;
  consecutiveAbsences: number;
  lastAttendedAt: string | null;
  nextSession: { id: string; scheduledDate: string; startTime: string } | null;
}

/** Mirror of TreatmentResource. Diagnosis and plan only with `patients.view_medical`. */
export interface Treatment extends GenericEntity, Versioned {
  type: TreatmentType;
  title: string;
  patientId: string;
  patient?: { id: string; code: string; fullName: string; phone: string };
  doctorId: string;
  doctor?: { id: string; fullName: string; specialty: string | null };
  appointmentId: string | null;
  appointment?: { id: string; code: string; scheduledDate: string } | null;
  billableServiceId: string | null;
  billableService?: { id: string; name: string; price: Money } | null;
  diagnosis?: string | null;
  plan?: string | null;
  priority: TreatmentPriority;
  status: GenericStatus;
  allowedTransitions: GenericStatus[];
  plannedSessions: number;
  sessionDurationMinutes: number;
  startDate: string | null;
  endDate: string | null;
  cancellationReason: string | null;
  progress?: TreatmentProgress;
}

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

/** One session to book (POST /treatments/{id}/sessions, or `sessions[]` of a new plan). */
export interface SessionBookingPayload {
  providerId: string;
  scheduledDate: string;
  startTime: string;
  endTime?: string | null;
  roomId?: string | null;
  reason?: string | null;
  notes?: string | null;
  overridePriorityDeadline?: boolean;
}

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

/** Bookable staff of GET /appointments/providers. */
export interface BookableProvider {
  id: string;
  fullName: string;
  jobTitle: string;
  department: string | null;
  isDoctor: boolean;
}
