import { Company } from '@interfaces/reference/company.interface';
import { CompanyPayload } from '@interfaces/reference/company-payload.interface';

/** New company (no `company`) or edit; the dialog closes with the saved company. */
export interface CompanyFormDialogData {
  company: Company | null;
  save: (payload: CompanyPayload) => Promise<Company>;
}
