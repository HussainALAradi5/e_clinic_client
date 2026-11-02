export interface DispenseItemPayload {
  medicationId: string;
  quantity: string;
  prescriptionItemId?: string | null;
  batchId?: string | null;
}
