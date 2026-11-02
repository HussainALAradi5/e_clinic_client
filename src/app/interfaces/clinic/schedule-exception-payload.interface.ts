import { ScheduleExceptionType } from '@enums/clinic/schedule-exception-type.enum';

/** POST /providers/{id}/schedules/exceptions and POST /schedules/holidays. */
export interface ScheduleExceptionPayload {
  date: string;
  type: ScheduleExceptionType;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
  cancelAffected?: boolean;
}
