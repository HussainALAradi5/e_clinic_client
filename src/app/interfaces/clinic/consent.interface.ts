import { ConsentType } from '@enums/clinic/consent-type.enum';
import { Attachment } from '@interfaces/attachment/attachment.interface';

/** Mirror of ConsentResource; `isValid` = not revoked and not expired. */
export interface PatientConsent {
  id: string;
  code: string;
  patientId: string;
  type: ConsentType;
  /** null = the whole patient file. */
  scope: {
    kind: 'appointment' | 'treatment' | 'clinical_order';
    id: string;
    code: string | null;
  } | null;
  description: string;
  signedByName: string;
  signerRelationship: string;
  explainedBy?: { id: string; fullName: string } | null;
  witness?: { id: string; fullName: string } | null;
  signedAt: string;
  validUntil: string | null;
  revokedAt: string | null;
  revocationReason: string | null;
  isValid: boolean;
  attachments?: Attachment[];
  createdAt: string;
}
