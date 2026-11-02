import { ExpiryStatus } from '@enums/pharmacy/expiry-status.enum';
import { StockLocation } from '@enums/pharmacy/stock-location.enum';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { Money } from '@interfaces/common/money.interface';
import { MedicationRef } from '@interfaces/pharmacy/medication-ref.interface';

/** Mirror of MedicationBatchResource — a stock lot with on-hand quantity, value and expiry status. */
export interface MedicationBatch extends GenericEntity {
  medicationId: string;
  medication?: MedicationRef;
  /** Pharmacy or treatment room. */
  location: StockLocation;
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
