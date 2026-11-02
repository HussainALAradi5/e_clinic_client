import { Vitals } from '@interfaces/clinic/vitals.interface';

/** PUT /appointments/{id}/medical-record — only the sent keys change; `diagnoses` replaces the list. */
export interface MedicalRecordPayload {
  version?: number | null;
  chiefComplaint?: string | null;
  history?: string | null;
  examination?: string | null;
  assessment?: string | null;
  plan?: string | null;
  vitals?: Partial<Vitals>;
  diagnoses?: { icd10CodeId: string; isPrimary?: boolean; notes?: string | null }[];
}
