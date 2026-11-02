import { InvoiceItemPayload } from '@interfaces/billing/invoice-item-payload.interface';

export interface InvoicePayload {
  version?: number;
  patientId?: string;
  notes?: string | null;
  items: InvoiceItemPayload[];
}
