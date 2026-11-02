import { ScheduleBlockPayload } from '@interfaces/clinic/schedule-block-payload.interface';

/** PUT /providers/{id}/schedules. */
export interface ReplaceSchedulePayload {
  effectiveFrom: string;
  blocks: ScheduleBlockPayload[];
}
