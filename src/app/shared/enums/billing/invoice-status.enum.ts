/** Mirror of App\Enums\Payments\InvoiceStatus — a draft collects charges; issuing numbers it and posts revenue. */
export enum InvoiceStatus {
  Draft = 'draft',
  Issued = 'issued',
  PartiallyPaid = 'partially_paid',
  Paid = 'paid',
  Cancelled = 'cancelled',
}

/** InvoiceStatus::isPayable() — payments are taken on issued invoices with a balance. */
export const PAYABLE_INVOICE_STATUSES: readonly InvoiceStatus[] = [
  InvoiceStatus.Issued,
  InvoiceStatus.PartiallyPaid,
];
