/** PATCH /clinical-orders/{id}/complete. */
export interface OrderResultPayload {
  report: string;
  isAbnormal?: boolean | null;
  reportedBy?: string | null;
}
