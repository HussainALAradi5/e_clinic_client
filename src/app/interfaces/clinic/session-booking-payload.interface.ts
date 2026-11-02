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
