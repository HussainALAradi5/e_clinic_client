import { Country } from '@interfaces/reference/country.interface';

/** PUT /reference/countries/{code} — only sent keys change. */
export type CountryPayload = Partial<
  Pick<Country, 'name' | 'nationality' | 'phoneCode' | 'isActive' | 'sortOrder'>
>;
