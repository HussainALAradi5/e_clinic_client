import { RecordAddendum } from '@interfaces/clinic/record-addendum.interface';
import { RecordDiagnosis } from '@interfaces/clinic/record-diagnosis.interface';
import { Vitals } from '@interfaces/clinic/vitals.interface';

/** Mirror of MedicalRecordResource (one per appointment). Notes and diagnoses only with `patients.view_medical`. */
export interface MedicalRecord {
  appointmentId: string;
  /** False before the first save (empty draft). */
  exists: boolean;
  chiefComplaint?: string | null;
  history?: string | null;
  examination?: string | null;
  assessment?: string | null;
  plan?: string | null;
  vitals: Vitals;
  diagnoses?: RecordDiagnosis[];
  addenda?: RecordAddendum[];
  isSigned: boolean;
  signedAt: string | null;
  signedBy: { id: string; fullName: string } | null;
  version: number | null;
  updatedAt: string | null;
}
