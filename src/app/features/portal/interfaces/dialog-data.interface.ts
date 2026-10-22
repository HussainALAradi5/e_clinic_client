import { Patient } from '@shared/interfaces/clinic/patient.interface';

/** A record's QR code shown full size, to be scanned at the desk or the pharmacy. */
export interface CodeDialogData {
  entity: string;
  recordId: string;
  title: string;
  /** Lines under the code (what, when, where). */
  lines: string[];
  hint: string;
}

export interface ProfileDialogData {
  patient: Patient;
}
