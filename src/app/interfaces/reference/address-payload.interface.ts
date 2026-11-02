/** Shared address payload (`address: {…}` of persons and companies). Bahrain: building + road + block required. */
export interface AddressPayload {
  countryCode: string;
  flat?: string | null;
  building?: string | null;
  road?: string | null;
  block?: string | null;
  area?: string | null;
  city?: string | null;
  governorate?: string | null;
  postalCode?: string | null;
  line1?: string | null;
  line2?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}
