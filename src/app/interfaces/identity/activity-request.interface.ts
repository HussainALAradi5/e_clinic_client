/** Which record's activity to fetch; no cursor means the first page. */
export interface ActivityRequest {
  /** `patient_profile`, `invoice` or any other record alias. */
  entity: string;
  recordId: string;
  cursor?: string;
}
