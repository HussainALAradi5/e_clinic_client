import { InsuranceClaim } from '@shared/interfaces/billing/insurance-claim.interface';
import {
  BillableService,
  BillableServicePayload,
} from '@shared/interfaces/billing/billable-service.interface';
import { Invoice } from '@shared/interfaces/billing/invoice.interface';
import { Payment } from '@shared/interfaces/billing/payment.interface';
import { PatientSummary } from '@shared/interfaces/common/summary.interface';
import { CashSession } from '@shared/interfaces/finance/cash-session.interface';

/** New price-list item or edit; closes with the saved item. */
export interface ServiceFormDialogData {
  service: BillableService | null;
  save: (payload: BillableServicePayload) => Promise<BillableService>;
}

/** Draft invoice lines: a new invoice (patient given or picked) or the patient's existing draft. */
export interface InvoiceEditorDialogData {
  invoice: Invoice | null;
  patient?: PatientSummary | null;
}

/** Take a payment (one or several methods) against an issued invoice; closes with the payments recorded. */
export interface PaymentDialogData {
  invoice: Invoice;
}

/** Ask for a refund of (part of) a payment. */
export interface RefundDialogData {
  payment: Payment;
  invoice: Pick<Invoice, 'id' | 'code' | 'invoiceNumber'> & { patient?: { fullName: string } };
}

/** Count and close the drawer. */
export interface CloseDrawerDialogData {
  session: CashSession;
}

/** Bank deposit of a closed drawer. */
export interface DepositDialogData {
  session: CashSession;
}

/** Record the insurer's answer to a pending claim. */
export interface ClaimDecisionDialogData {
  claim: InsuranceClaim;
}
