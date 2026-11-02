import { Doctor } from '@interfaces/clinic/doctor.interface';

/** New doctor profile (pick an employee) or edit. */
export interface DoctorFormDialogData {
  doctor: Doctor | null;
}
