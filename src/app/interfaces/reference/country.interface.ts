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
