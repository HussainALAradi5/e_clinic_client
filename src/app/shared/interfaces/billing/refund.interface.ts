import { ApprovalStatus } from '@shared/enums/shared/approval-status.enum';
import { PaymentMethod } from '@shared/enums/shared/payment-method.enum';
import { Money } from '@shared/interfaces/common/money.interface';
import { PatientSummary, UserSummary } from '@shared/interfaces/common/summary.interface';

/** Mirror of RefundResource — requested → approved by someone else → paid out (`isProcessed`). */
export interface Refund {
  id: string;
  code: string;
  paymentId: string;
  payment?: { id: string; code: string; method: PaymentMethod; amount: Money; paidAt: string };
  invoiceId: string;
  invoice?: { id: string; code: string; invoiceNumber: string | null };
  patient?: PatientSummary;
  amount: Money;
  method: PaymentMethod;
  reason: string;
  status: ApprovalStatus;
  isProcessed: boolean;
  requestedBy?: UserSummary | null;
  approvedBy?: UserSummary | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  processedBy?: UserSummary | null;
  processedAt: string | null;
  referenceNumber: string | null;
  cashSessionId: string | null;
  createdAt: string;
}

export interface RefundPayload {
  paymentId: string;
  amount: string;
  method?: PaymentMethod | null;
  reason: string;
}
