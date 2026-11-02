import { DiscountType } from '@enums/billing/discount-type.enum';
import { Money } from '@interfaces/common/money.interface';

/** Mirror of InvoiceItemResource. `source` = the visit / order it bills (null = typed by hand). */
export interface InvoiceItem {
  id: string;
  billableServiceId: string | null;
  billableService?: { id: string; code: string; name: string } | null;
  source: { type: string; id: string; code: string | null } | null;
  doctorId: string | null;
  doctor?: { id: string; fullName: string } | null;
  description: string;
  quantity: string;
  unitPrice: Money;
  discountType: DiscountType | null;
  discountValue: string;
  discountAmount: Money;
  taxRate: string;
  taxAmount: Money;
  lineTotal: Money;
}
