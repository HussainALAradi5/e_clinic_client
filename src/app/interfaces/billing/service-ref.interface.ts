import { Money } from '@interfaces/common/money.interface';

/** Short reference to a price-list item (doctor fees, booked service). */
export interface ServiceRef {
  id: string;
  code?: string;
  name: string;
  price: Money;
}
