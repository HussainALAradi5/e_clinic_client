import { Doctor } from '@interfaces/clinic/doctor.interface';
import { Patient } from '@interfaces/clinic/patient.interface';

/** Booking wizard presets (from the calendar, a patient file or a doctor). */
export interface BookingWizardData {
  patient?: Patient | null;
  doctor?: Doctor | null;
  date?: string;
  startTime?: string;
}
