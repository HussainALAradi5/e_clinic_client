import { ScheduleExceptionType } from '@shared/enums/clinic/schedule-exception-type.enum';

/** Mirror of ProviderScheduleResource — one weekly working block. */
export interface ScheduleBlock {
  id: string;
  code: string;
  providerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
}

/** PUT /providers/{id}/schedules block. */
export interface ScheduleBlockPayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes?: number | null;
}

/** PUT /providers/{id}/schedules. */
export interface ReplaceSchedulePayload {
  effectiveFrom: string;
  blocks: ScheduleBlockPayload[];
}

/** Mirror of ScheduleExceptionResource — day off / custom hours of a provider, or a clinic holiday. */
export interface ScheduleException {
  id: string;
  code: string;
  providerId: string | null;
  isClinicWide: boolean;
  date: string;
  type: ScheduleExceptionType;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
}

/** POST /providers/{id}/schedules/exceptions and POST /schedules/holidays. */
export interface ScheduleExceptionPayload {
  date: string;
  type: ScheduleExceptionType;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
  cancelAffected?: boolean;
}

/** `meta.appointments` of 409 SCHEDULE_HAS_APPOINTMENTS. */
export interface AffectedBooking {
  id: string;
  code: string;
  date: string;
  startTime: string;
  patient: string;
}
