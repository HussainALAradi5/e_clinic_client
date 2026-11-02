/** ICD-10 catalog entry (GET /icd10?search=). */
export interface Icd10Code {
  id: string;
  code: string;
  title: string;
  titleAr: string | null;
  chapter: string | null;
  isBillable: boolean;
}
