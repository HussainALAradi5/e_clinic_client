import { InvoiceStatus } from '@enums/billing/invoice-status.enum';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { InvoiceItem } from '@interfaces/billing/invoice-item.interface';
import { Payment } from '@interfaces/billing/payment.interface';
import { Refund } from '@interfaces/billing/refund.interface';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { Versioned } from '@interfaces/common/versioned.interface';
import { Money } from '@interfaces/common/money.interface';
import { PatientSummary } from '@interfaces/common/summary.interface';
import { UserSummary } from '@interfaces/common/user-summary.interface';
import { InvoicePaymentState } from '@enums/billing/invoice-payment-state.enum';
import { PaymentMethod } from '@enums/shared/payment-method.enum';

/** Mirror of InvoiceResource — lines, payments and refunds on the detail. */
export interface Invoice extends GenericEntity, Versioned {
  invoiceNumber: string | null;
  patientId: string;
  patient?: PatientSummary & { insurer: { id: string; name: string } | null };
  issueDate: string | null;
  dueDate: string | null;
  currency: string;
  subtotal: Money;
  discountTotal: Money;
  taxTotal: Money;
  total: Money;
  paidAmount: Money;
  refundedAmount: Money;
  balanceDue: Money;
  /** Payment reminders sent to the patient, and when the last one went out. */
  remindersSent?: number;
  lastRemindedAt?: string | null;
  status: InvoiceStatus;
  /** Unpaid, overdue, partly paid, paid, refunded … (worked out by the server). */
  paymentState: InvoicePaymentState;
  /** How it was paid: methods of its completed payments (lists). */
  paymentMethods?: PaymentMethod[];
  notes: string | null;
  issuedAt: string | null;
  issuedBy?: UserSummary | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  journalEntryId: string | null;
  items?: InvoiceItem[];
  payments?: Payment[];
  refunds?: Refund[];
  claims?: { id: string; code: string; status: ApprovalStatus; claimedAmount: Money }[];
}
