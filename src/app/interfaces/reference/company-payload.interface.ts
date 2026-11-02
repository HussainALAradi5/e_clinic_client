import { CompanyType } from '@enums/reference/company-type.enum';
import { AddressPayload } from '@interfaces/reference/address-payload.interface';

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
