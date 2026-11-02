export interface RecordDiagnosis {
  icd10CodeId: string;
  code: string;
  title: string;
  titleAr: string | null;
  isPrimary: boolean;
  notes: string | null;
}
