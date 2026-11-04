/** The clinic profile (ClinicProfileResource) printed on every PDF; image paths are null while none is set. */
export interface ClinicProfile {
  id: string;
  code: string;
  name: string;
  tagline: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoPath: string | null;
  stampPath: string | null;
  updatedAt: string | null;
}
