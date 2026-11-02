import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { InvoiceItem } from '@interfaces/billing/invoice.interface';
import { Money } from '@interfaces/common/money.interface';
import { PatientSummary } from '@interfaces/common/summary.interface';

/** ICD-10 code of a visit on the claim (claim staff only). */
export interface ClaimDiagnosis {
  code: string;
  title: string;
  isPrimary: boolean;
  visit: string;
}

/** Mirror of InsuranceClaimResource — draft → pending (sent) → approved / rejected → remitted. */
export interface InsuranceClaim {
  id: string;
  code: string;
  invoiceId: string;
  invoice?: {
    id: string;
    code: string;
    invoiceNumber: string | null;
    issueDate: string | null;
    total: Money;
    balanceDue: Money;
    items?: InvoiceItem[];
  };
  patientId: string;
  patient?: PatientSummary;
  insurerId: string;
  insurer?: { id: string; name: string };
  policyNumber: string;
  coveragePercent: string;
  preAuthorizationNumber: string | null;
  claimedAmount: Money;
  approvedAmount: Money | null;
  status: ApprovalStatus;
  submittedAt: string | null;
  decidedAt: string | null;
  insurerReference: string | null;
  rejectionReason: string | null;
  cancellationReason: string | null;
  paymentId: string | null;
  remittedAt: string | null;
  remittanceReference: string | null;
  diagnoses?: ClaimDiagnosis[];
  createdAt: string;
  updatedAt: string;
}

/** PATCH /billing/insurance-claims/{id}/decision. */
export interface ClaimDecisionPayload {
  approved: boolean;
  approvedAmount?: string | null;
  insurerReference?: string | null;
  rejectionReason?: string | null;
}

/** POST /billing/insurance-claims/remittances — one insurer transfer for approved claims. */
export interface RemittancePayload {
  claimIds: string[];
  date: string;
  reference: string;
  amount: string;
}
