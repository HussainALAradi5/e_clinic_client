/** Any record picked in a lookup (doctor, patient, room …): enough to show its name. */
export interface LookupRow {
  id: string;
  fullName?: string;
  name?: string;
  code?: string;
}
