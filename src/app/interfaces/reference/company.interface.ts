import { CompanyType } from '@enums/reference/company-type.enum';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { Address } from '@interfaces/reference/address.interface';
import { Country } from '@interfaces/reference/country.interface';

/** Mirror of CompanyResource — manufacturer, supplier, insurer, lab, hospital … */
export interface Company extends GenericEntity {
  type: CompanyType;
  name: string;
  description: string | null;
  countryCode: string;
  country?: Country;
  address: Address | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  contactPerson: string | null;
  vatNumber: string | null;
  crNumber: string | null;
  /** Detail only: records using the company, e.g. `{ medications: 12 }`. */
  usage?: Record<string, number>;
}
