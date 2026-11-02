import { ConsentType } from '@enums/clinic/consent-type.enum';
import { Patient } from '@interfaces/clinic/patient.interface';

/** Record a consent; the scope and type can be preset (e.g. a procedure that needs one). */
export interface ConsentDialogData {
  patient: Patient;
  type?: ConsentType | null;
  appointmentId?: string | null;
  treatmentId?: string | null;
  clinicalOrderId?: string | null;
}
