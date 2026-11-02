import { Appointment } from '@interfaces/clinic/appointment.interface';

/** Cancel, reschedule or complete one booking. */
export interface AppointmentDialogData {
  appointment: Appointment;
}
