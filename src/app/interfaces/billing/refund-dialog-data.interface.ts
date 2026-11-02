import { Invoice } from '@interfaces/billing/invoice.interface';
import { Payment } from '@interfaces/billing/payment.interface';

/** Ask for a refund of (part of) a payment. */
export interface RefundDialogData {
  payment: Payment;
  invoice: Pick<Invoice, 'id' | 'code' | 'invoiceNumber'> & { patient?: { fullName: string } };
}
