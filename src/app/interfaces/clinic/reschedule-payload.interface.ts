/** POST /appointments/{id}/reschedule. */
export interface ReschedulePayload {
  scheduledDate: string;
  startTime: string;
  providerId?: string | null;
  roomId?: string | null;
}
