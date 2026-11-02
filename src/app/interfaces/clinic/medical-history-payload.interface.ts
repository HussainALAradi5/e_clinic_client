/** PUT /patients/{id}/medical-history — the care team's medical history (absent fields unchanged). */
export interface MedicalHistoryPayload {
  version: number;
  allergies?: string | null;
  chronicConditions?: string | null;
  familyHistory?: string | null;
  surgicalHistory?: string | null;
}
