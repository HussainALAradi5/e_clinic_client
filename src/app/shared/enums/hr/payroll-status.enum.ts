/** Mirror of App\Enums\HR\PayrollStatus — draft → calculated → approved → paid; cancelled before payment. */
export enum PayrollStatus {
  Draft = 'draft',
  Calculated = 'calculated',
  Approved = 'approved',
  Paid = 'paid',
  Cancelled = 'cancelled',
}
