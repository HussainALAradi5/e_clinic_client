import { MedicationBatch } from '@interfaces/pharmacy/inventory.interface';

/** Count correction of one lot; closes with the ledger row. */
export interface AdjustStockDialogData {
  batch: MedicationBatch;
}
