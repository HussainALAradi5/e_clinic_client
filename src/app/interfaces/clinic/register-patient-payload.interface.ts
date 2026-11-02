import { PatientFields } from '@interfaces/clinic/patient-fields.interface';
import { NewPersonPayload } from '@interfaces/identity/new-person-payload.interface';

/** POST /patients — an existing person (`personId`) or a new one. */
export interface RegisterPatientPayload extends PatientFields {
  personId?: string;
  person?: NewPersonPayload;
  forceCreate?: boolean;
}
