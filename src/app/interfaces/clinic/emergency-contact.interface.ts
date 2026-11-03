/** One emergency / additional contact of a patient: a phone, the name and relation optional. */
export interface EmergencyContact {
  name: string | null;
  relation: string | null;
  phone: string;
}
