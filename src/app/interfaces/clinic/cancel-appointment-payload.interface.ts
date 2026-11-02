import { CancelledBy } from '@enums/clinic/cancelled-by.enum';

/** PATCH /appointments/{id}/cancel. */
export interface CancelAppointmentPayload {
  reason: string;
  cancelledBy: CancelledBy;
}
