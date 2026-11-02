import { Country } from '@interfaces/reference/country.interface';
import { CountryPayload } from '@interfaces/reference/country-payload.type';

/** Edit labels / order / active flag of a country. */
export interface CountryFormDialogData {
  country: Country;
  save: (payload: CountryPayload) => Promise<Country>;
}
