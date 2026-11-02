import { DiscountType } from '@enums/billing/discount-type.enum';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { InvoiceStatus } from '@enums/billing/invoice-status.enum';
import { Payment } from '@interfaces/billing/payment.interface';
import { Refund } from '@interfaces/billing/refund.interface';
import { GenericEntity, Versioned } from '@interfaces/common/generic-entity.interface';
import { Money } from '@interfaces/common/money.interface';
import { PatientSummary, UserSummary } from '@interfaces/common/summary.interface';

/** Short reference shown on a visit or order that is billed ("on INV-…"). */
export interface InvoiceRef {
  id: string;
  code: string;
  invoiceNumber: string | null;
  status: InvoiceStatus;
}

/** Mirror of InvoiceItemResource. `source` = the visit / order it bills (null = typed by hand). */
export interface InvoiceItem {
  id: string;
  billableServiceId: string | null;
  billableService?: { id: string; code: string; name: string } | null;
  source: { type: string; id: string; code: string | null } | null;
  doctorId: string | null;
  doctor?: { id: string; fullName: string } | null;
  description: string;
  quantity: string;
  unitPrice: Money;
  discountType: DiscountType | null;
  discountValue: string;
  discountAmount: Money;
  taxRate: string;
  taxAmount: Money;
  lineTotal: Money;
}

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
  status: InvoiceStatus;
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

/** A line of POST / PUT /billing/invoices: a price-list service or a free-text line with its own price. */
export interface InvoiceItemPayload {
  id?: string | null;
  billableServiceId?: string | null;
  description?: string | null;
  quantity: string;
  unitPrice?: string | null;
  discountType?: DiscountType | null;
  discountValue?: string | null;
  doctorId?: string | null;
}

export interface InvoicePayload {
  version?: number;
  patientId?: string;
  notes?: string | null;
  items: InvoiceItemPayload[];
}

/** POST /billing/invoices/charge — bill a visit (checked in or later) or a clinical order by hand. */
export interface ChargePayload {
  sourceType: 'appointment' | 'clinical_order';
  sourceId: string;
}
