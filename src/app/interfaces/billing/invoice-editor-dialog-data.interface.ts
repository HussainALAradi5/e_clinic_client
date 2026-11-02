import { Invoice } from '@interfaces/billing/invoice.interface';
import { PatientSummary } from '@interfaces/common/summary.interface';

/** Draft invoice lines: a new invoice (patient given or picked) or the patient's existing draft. */
export interface InvoiceEditorDialogData {
  invoice: Invoice | null;
  patient?: PatientSummary | null;
}
