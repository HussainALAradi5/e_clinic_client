/** POST /billing/insurance-claims/remittances — one insurer transfer for approved claims. */
export interface RemittancePayload {
  claimIds: string[];
  date: string;
  reference: string;
  amount: string;
}
