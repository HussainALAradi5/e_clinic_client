import { ConsentType } from '@enums/clinic/consent-type.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { ClinicalOrder } from '@interfaces/clinic/clinical-order.interface';
import { Treatment } from '@interfaces/clinic/treatment.interface';
import { Doctor } from '@interfaces/clinic/doctor.interface';
import { Patient } from '@interfaces/clinic/patient.interface';
import { Room, RoomPayload } from '@interfaces/clinic/room.interface';
import { Specialty, SpecialtyPayload } from '@interfaces/clinic/doctor.interface';

/** Edit the medical / insurance part of a patient file. */
export interface PatientFormDialogData {
  patient: Patient;
}

/** New doctor profile (pick an employee) or edit. */
export interface DoctorFormDialogData {
  doctor: Doctor | null;
}

/** New or edited specialty. */
export interface SpecialtyFormDialogData {
  specialty: Specialty | null;
  save: (payload: SpecialtyPayload) => Promise<Specialty>;
}

/** New or edited room. */
export interface RoomFormDialogData {
  room: Room | null;
  save: (payload: RoomPayload) => Promise<Room>;
}

/** Booking wizard presets (from the calendar, a patient file or a doctor). */
export interface BookingWizardData {
  patient?: Patient | null;
  doctor?: Doctor | null;
  date?: string;
  startTime?: string;
}

/** Cancel, reschedule or complete one booking. */
export interface AppointmentDialogData {
  appointment: Appointment;
}

/** Add a day off / custom hours for a provider, or a clinic-wide holiday (`providerId` null). */
export interface ScheduleExceptionDialogData {
  providerId: string | null;
}

/** Prescribe a plan (optionally from a visit) or edit one. */
export interface TreatmentFormDialogData {
  treatment: Treatment | null;
  patient?: Patient | null;
  appointmentId?: string | null;
  doctorId?: string | null;
}

/** Book the next session, change priority, … of one plan. */
export interface TreatmentDialogData {
  treatment: Treatment;
}

/** New imaging / lab / ECG order or referral for a patient (from a visit or treatment when given). */
export interface OrderFormDialogData {
  patient: Pick<Patient, 'id' | 'fullName'>;
  appointmentId?: string | null;
  treatmentId?: string | null;
}

/** Start, complete or link one order. */
export interface OrderDialogData {
  order: ClinicalOrder;
}

/** Record a consent; the scope and type can be preset (e.g. a procedure that needs one). */
export interface ConsentDialogData {
  patient: Patient;
  type?: ConsentType | null;
  appointmentId?: string | null;
  treatmentId?: string | null;
  clinicalOrderId?: string | null;
}
