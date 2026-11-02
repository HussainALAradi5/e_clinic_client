export interface StockAdjustmentPayload {
  quantity: string;
  reason: string;
  approvedBy: string | null;
}
