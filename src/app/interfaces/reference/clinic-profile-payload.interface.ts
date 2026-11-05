/** PUT /reference/clinic-profile — the letterhead text. */
export interface ClinicProfilePayload {
  name: string;
  tagline: string | null;
  address: string | null;
  /** ISO 3166 code from the country list. */
  countryCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
}
