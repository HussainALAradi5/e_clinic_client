import { AccountRef } from '@shared/interfaces/accounting/account.interface';
import { ConsentType } from '@shared/enums/clinic/consent-type.enum';
import { ServiceCategory } from '@shared/enums/billing/service-category.enum';
import { GenericEntity } from '@shared/interfaces/common/generic-entity.interface';
import { Money } from '@shared/interfaces/common/money.interface';

/** Short reference to a price-list item (doctor fees, booked service). */
export interface ServiceRef {
  id: string;
  code?: string;
  name: string;
  price: Money;
}

/** Mirror of BillableServiceResource — one price-list item. */
export interface BillableService extends GenericEntity {
  name: string;
  nameAr: string | null;
  category: ServiceCategory;
  price: Money;
  taxRate: string;
  revenueAccountId: string;
  revenueAccount?: AccountRef;
  specialtyId: string | null;
  specialty?: { id: string; code: string; name: string } | null;
  isInsurable: boolean;
  consentType: ConsentType | null;
  usage?: Record<string, number>;
}

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
