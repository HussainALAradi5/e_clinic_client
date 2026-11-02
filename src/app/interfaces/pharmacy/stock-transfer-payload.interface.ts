import { StockLocation } from '@enums/pharmacy/stock-location.enum';

/** `POST pharmacy/inventory/batches/{id}/transfer` — move units to the other place. */
export interface StockTransferPayload {
  quantity: string;
  to: StockLocation;
  reason?: string | null;
}
