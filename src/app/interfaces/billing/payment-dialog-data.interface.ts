import { Invoice } from '@interfaces/billing/invoice.interface';

/** Take a payment (one or several methods) against an issued invoice; closes with the payments recorded. */
export interface PaymentDialogData {
  invoice: Invoice;
}
