import { DispenseItemPayload } from '@interfaces/pharmacy/dispense-item-payload.interface';

/** Pharmacy hand-over: against a prescription or over the counter. */
export interface DispensePayload {
  patientId: string;
  prescriptionId?: string | null;
  items: DispenseItemPayload[];
  witnessId?: string | null;
  notes?: string | null;
}
