/** POST /people/duplicates. */
export interface DuplicateCheckPayload {
  nationalId?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  exceptId?: string | null;
}
