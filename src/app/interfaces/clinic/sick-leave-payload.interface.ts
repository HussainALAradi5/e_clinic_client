/** `POST appointments/{id}/sick-leaves`. */
export interface SickLeavePayload {
  startDate: string;
  endDate: string;
  reason?: string | null;
  showReason?: boolean;
  notes?: string | null;
}
