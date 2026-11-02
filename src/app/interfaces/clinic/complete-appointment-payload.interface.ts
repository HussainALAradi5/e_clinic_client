/** PATCH /appointments/{id}/complete. */
export interface CompleteAppointmentPayload {
  billableServiceIds?: string[];
  followUpInDays?: number | null;
}
