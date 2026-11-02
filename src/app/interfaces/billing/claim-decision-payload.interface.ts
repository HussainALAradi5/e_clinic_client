/** PATCH /billing/insurance-claims/{id}/decision. */
export interface ClaimDecisionPayload {
  approved: boolean;
  approvedAmount?: string | null;
  insurerReference?: string | null;
  rejectionReason?: string | null;
}
