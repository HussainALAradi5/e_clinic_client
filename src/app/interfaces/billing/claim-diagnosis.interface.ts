/** ICD-10 code of a visit on the claim (claim staff only). */
export interface ClaimDiagnosis {
  code: string;
  title: string;
  isPrimary: boolean;
  visit: string;
}
