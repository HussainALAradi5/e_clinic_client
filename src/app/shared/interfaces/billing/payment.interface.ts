import { PaymentStatus } from '@shared/enums/billing/payment-status.enum';
import { CashSessionStatus } from '@shared/enums/finance/cash-session-status.enum';
import { PaymentMethod } from '@shared/enums/shared/payment-method.enum';
import { Refund } from '@shared/interfaces/billing/refund.interface';
import { Money } from '@shared/interfaces/common/money.interface';
import { PatientSummary, UserSummary } from '@shared/interfaces/common/summary.interface';

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

/** POST /billing/payments — one method; a split payment is one request per method. */
export interface PaymentPayload {
  invoiceId: string;
  amount: string;
  method: PaymentMethod;
  referenceNumber?: string | null;
  cardLast4?: string | null;
  notes?: string | null;
}

/** GET /billing/payments/daily-summary — end-of-day takings per method and cashier. */
export interface DailySummary {
  date: string;
  rows: {
    method: PaymentMethod;
    receivedBy: string;
    cashier: string;
    count: number;
    total: string;
  }[];
  totals: { method: PaymentMethod; total: string }[];
  grandTotal: string;
  refunds: string;
}
