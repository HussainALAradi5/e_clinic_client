/** Bookable staff of GET /appointments/providers. */
export interface BookableProvider {
  id: string;
  fullName: string;
  jobTitle: string;
  department: string | null;
  isDoctor: boolean;
}
