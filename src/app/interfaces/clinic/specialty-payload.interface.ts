/** POST / PUT /doctors/specialties. */
export interface SpecialtyPayload {
  code?: string;
  name?: string;
  nameAr?: string | null;
  description?: string | null;
}
