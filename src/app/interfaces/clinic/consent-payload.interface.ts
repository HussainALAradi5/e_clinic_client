import { ConsentType } from '@enums/clinic/consent-type.enum';

/** POST /patients/{id}/consents. */
export interface ConsentPayload {
  type: ConsentType;
  appointmentId?: string | null;
  treatmentId?: string | null;
  clinicalOrderId?: string | null;
  description: string;
  signedByName: string;
  signerRelationship: string;
  explainedBy: string;
  witnessId?: string | null;
  signedAt: string;
  validUntil?: string | null;
  signatureAttachmentId?: string | null;
}
