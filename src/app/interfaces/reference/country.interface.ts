/** Mirror of CountryResource (ISO-3166, keyed by alpha-2). */
export interface Country {
  code: string;
  iso3: string;
  name: string;
  nationality: string;
  phoneCode: string;
  currencyCode: string | null;
  isActive: boolean;
  sortOrder: number;
}

/** PUT /reference/countries/{code} — only sent keys change. */
export type CountryPayload = Partial<
  Pick<Country, 'name' | 'nationality' | 'phoneCode' | 'isActive' | 'sortOrder'>
>;
