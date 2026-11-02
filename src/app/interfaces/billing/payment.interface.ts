import { PaymentStatus } from '@enums/billing/payment-status.enum';
import { CashSessionStatus } from '@enums/finance/cash-session-status.enum';
import { PaymentMethod } from '@enums/shared/payment-method.enum';
import { Refund } from '@interfaces/billing/refund.interface';
import { Money } from '@interfaces/common/money.interface';
import { PatientSummary } from '@interfaces/common/summary.interface';
import { UserSummary } from '@interfaces/common/user-summary.interface';

/** Mirror of PaymentResource — its code is the receipt number. */
export interface Payment {
  id: string;
  code: string;
  invoiceId: string;
  invoice?: {
    id: string;
    code: string;
    invoiceNumber: string | null;
    total: Money;
    balanceDue: Money;
  };
  patientId: string;
  patient?: PatientSummary;
  amount: Money;
  refundedAmount: Money;
  refundable: Money;
  method: PaymentMethod;
  status: PaymentStatus;
  referenceNumber: string | null;
  cardLast4: string | null;
  paidAt: string;
  receivedBy?: UserSummary | null;
  cashSessionId: string | null;
  cashSession?: { id: string; code: string; status: CashSessionStatus } | null;
  voidedAt: string | null;
  voidReason: string | null;
  notes: string | null;
  refunds?: Refund[];
  journalEntryId: string | null;
  createdAt: string;
}
