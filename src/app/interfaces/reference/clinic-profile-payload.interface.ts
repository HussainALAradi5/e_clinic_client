/** PUT /reference/clinic-profile — the letterhead text. */
export interface ClinicProfilePayload {
  name: string;
  tagline: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
}
