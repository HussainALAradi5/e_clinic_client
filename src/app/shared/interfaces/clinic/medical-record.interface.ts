/** Vital signs of a visit; BMI is computed by the server. */
export interface Vitals {
  temperatureC: number | null;
  pulseBpm: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  respiratoryRate: number | null;
  spo2Percent: number | null;
  weightKg: number | null;
  heightCm: number | null;
  bmi?: number | null;
}

/** ICD-10 catalog entry (GET /icd10?search=). */
export interface Icd10Code {
  id: string;
  code: string;
  title: string;
  titleAr: string | null;
  chapter: string | null;
  isBillable: boolean;
}

export interface RecordDiagnosis {
  icd10CodeId: string;
  code: string;
  title: string;
  titleAr: string | null;
  isPrimary: boolean;
  notes: string | null;
}

export interface RecordAddendum {
  id: string;
  text: string;
  author: string | null;
  createdAt: string;
}

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
