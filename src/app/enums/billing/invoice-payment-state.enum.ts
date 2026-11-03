/** Mirror of App\Enums\Payments\InvoicePaymentState — how an invoice stands with its payments (worked out by the server). */
export enum InvoicePaymentState {
  Draft = 'draft',
  Unpaid = 'unpaid',
  Overdue = 'overdue',
  PartiallyPaid = 'partially_paid',
  Paid = 'paid',
  Refunded = 'refunded',
  Cancelled = 'cancelled',
}
