/** Mirror of App\Enums\Pharmacy\StockMovementType — reason of a stock ledger row (+ in, − out). */
export enum StockMovementType {
  Receipt = 'receipt',
  Dispense = 'dispense',
  Return = 'return',
  Adjustment = 'adjustment',
  ExpiryWriteoff = 'expiry_writeoff',
  /** Moved between the pharmacy and the treatment room. */
  Transfer = 'transfer',
}
