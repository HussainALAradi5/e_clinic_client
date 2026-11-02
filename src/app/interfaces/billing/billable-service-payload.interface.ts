import { ServiceCategory } from '@enums/billing/service-category.enum';
import { ConsentType } from '@enums/clinic/consent-type.enum';

/** POST / PUT /billing/services. */
export interface BillableServicePayload {
  code?: string;
  name?: string;
  nameAr?: string | null;
  category?: ServiceCategory;
  price?: string;
  taxRate?: string;
  revenueAccountId?: string;
  specialtyId?: string | null;
  isInsurable?: boolean;
  consentType?: ConsentType | null;
}
