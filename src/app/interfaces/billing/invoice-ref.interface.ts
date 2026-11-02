import { InvoiceStatus } from '@enums/billing/invoice-status.enum';

/** Short reference shown on a visit or order that is billed ("on INV-…"). */
export interface InvoiceRef {
  id: string;
  code: string;
  invoiceNumber: string | null;
  status: InvoiceStatus;
}
