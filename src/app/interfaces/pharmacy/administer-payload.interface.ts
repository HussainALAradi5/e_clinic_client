import { StockLocation } from '@enums/pharmacy/stock-location.enum';
import { AdministerItemPayload } from '@interfaces/pharmacy/administer-item-payload.interface';

/** Medicines given during a checked-in / in-progress session. */
export interface AdministerPayload {
  items: AdministerItemPayload[];
  witnessId?: string | null;
  notes?: string | null;
  /** Whose stock: the treatment room (default) or the pharmacy. */
  from?: StockLocation;
}
