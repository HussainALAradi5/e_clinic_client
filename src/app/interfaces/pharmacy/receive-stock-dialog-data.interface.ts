import { Medication } from '@interfaces/pharmacy/medication.interface';

/** Goods receipt, optionally for a preset medication; closes with the received lot. */
export interface ReceiveStockDialogData {
  medication: Medication | null;
}
