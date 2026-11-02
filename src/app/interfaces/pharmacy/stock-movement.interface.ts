import { StockMovementType } from '@enums/pharmacy/stock-movement-type.enum';
import { UserSummary } from '@interfaces/common/user-summary.interface';
import { MedicationRef } from '@interfaces/pharmacy/medication-ref.interface';

/** Mirror of StockMovementResource — one append-only ledger row (signed quantity). */
export interface StockMovement {
  id: string;
  type: StockMovementType;
  quantity: string;
  medicationId: string;
  medication?: MedicationRef;
  batchId: string;
  batch?: { id: string; code: string; batchNumber: string };
  sourceType: string | null;
  sourceId: string | null;
  reason: string | null;
  createdBy?: UserSummary | null;
  approvedBy?: UserSummary | null;
  createdAt: string;
}
