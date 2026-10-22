import { ExpiryStatus } from '@shared/enums/pharmacy/expiry-status.enum';
import { StockMovementType } from '@shared/enums/pharmacy/stock-movement-type.enum';
import { ApprovalStatus } from '@shared/enums/shared/approval-status.enum';
import { GenericEntity } from '@shared/interfaces/common/generic-entity.interface';
import { Money } from '@shared/interfaces/common/money.interface';
import { UserSummary } from '@shared/interfaces/common/summary.interface';
import { MedicationRef } from '@shared/interfaces/pharmacy/medication.interface';

/** Mirror of MedicationBatchResource — a stock lot with on-hand quantity, value and expiry status. */
export interface MedicationBatch extends GenericEntity {
  medicationId: string;
  medication?: MedicationRef;
  batchNumber: string;
  expiryDate: string;
  expiryStatus: ExpiryStatus;
  qtyReceived: string;
  qtyOnHand: string;
  unitCost: Money;
  stockValue: Money;
  supplierId: string | null;
  supplier?: { id: string; name: string } | null;
  expense?: { id: string; code: string; status: ApprovalStatus } | null;
  receivedAt: string;
  isQuarantined: boolean;
  quarantineReason: string | null;
}

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

export interface ReceiveStockPayload {
  medicationId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: string;
  unitCost: string;
  supplierId: string | null;
  createExpense: boolean;
  vendorInvoiceNumber: string | null;
}

export interface StockAdjustmentPayload {
  quantity: string;
  reason: string;
  approvedBy: string | null;
}
