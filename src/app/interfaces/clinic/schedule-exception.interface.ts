import { ScheduleExceptionType } from '@enums/clinic/schedule-exception-type.enum';

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
