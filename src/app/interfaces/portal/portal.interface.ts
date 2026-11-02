import { AppointmentType } from '@enums/clinic/appointment-type.enum';

/** POST /portal/appointments — always for the signed-in patient; the clinic confirms it. */
export interface PortalBookingPayload {
  doctorId: string;
  type: AppointmentType;
  scheduledDate: string;
  startTime: string;
  reason?: string | null;
}
