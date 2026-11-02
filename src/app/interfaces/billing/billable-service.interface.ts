import { ServiceCategory } from '@enums/billing/service-category.enum';
import { ConsentType } from '@enums/clinic/consent-type.enum';
import { AccountRef } from '@interfaces/accounting/account-ref.interface';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { Money } from '@interfaces/common/money.interface';

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
