import { Company, CompanyPayload } from '@shared/interfaces/reference/company.interface';
import { Country, CountryPayload } from '@shared/interfaces/reference/country.interface';

/** New company (no `company`) or edit; the dialog closes with the saved company. */
export interface CompanyFormDialogData {
  company: Company | null;
  save: (payload: CompanyPayload) => Promise<Company>;
}

/** Edit labels / order / active flag of a country. */
export interface CountryFormDialogData {
  country: Country;
  save: (payload: CountryPayload) => Promise<Country>;
}
