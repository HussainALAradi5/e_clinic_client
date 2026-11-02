/** GET /patients/lookup — who the patient is (no medical data) and whether the file is open to the caller. */
export interface PatientLookup {
  id: string;
  code: string;
  fullName: string;
  gender: string;
  age: number;
  inCare: boolean;
}
