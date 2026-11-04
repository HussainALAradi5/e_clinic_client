/** Mirror of WalletEntryType: one movement of a patient's balance. */
export enum WalletEntryType {
  Deposit = 'deposit',
  InvoicePayment = 'invoice_payment',
  PaymentReversal = 'payment_reversal',
  Withdrawal = 'withdrawal',
  AdjustmentCredit = 'adjustment_credit',
  AdjustmentDebit = 'adjustment_debit',
  Fee = 'fee',
}
