import { Money } from '@interfaces/common/money.interface';

/** The amounts an invoice's payment progress is worked out from. */
export interface InvoiceProgressSource {
  total: Money;
  balanceDue: Money;
}
