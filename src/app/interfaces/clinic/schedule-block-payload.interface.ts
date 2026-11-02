/** PUT /providers/{id}/schedules block. */
export interface ScheduleBlockPayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes?: number | null;
}
