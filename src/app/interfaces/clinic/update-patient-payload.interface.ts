import { PatientFields } from '@interfaces/clinic/patient-fields.interface';

/** PUT /patients/{id}. */
export interface UpdatePatientPayload extends PatientFields {
  version: number;
}
