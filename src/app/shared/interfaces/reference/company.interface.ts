import { Address, AddressPayload } from './address.interface';
import { Country } from './country.interface';
import { CompanyType } from '@shared/enums/reference/company-type.enum';
import { GenericEntity } from '@shared/interfaces/common/generic-entity.interface';

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

/** POST / PUT /reference/companies (`address: null` removes it). */
export interface CompanyPayload {
  type?: CompanyType;
  name?: string;
  description?: string | null;
  countryCode?: string;
  address?: AddressPayload | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  contactPerson?: string | null;
  vatNumber?: string | null;
  crNumber?: string | null;
}
