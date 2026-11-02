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
