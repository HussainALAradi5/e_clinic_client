import { InsuranceClaim } from '@interfaces/billing/insurance-claim.interface';

/** Record the insurer's answer to a pending claim. */
export interface ClaimDecisionDialogData {
  claim: InsuranceClaim;
}
