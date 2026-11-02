import { DiscountType } from '@enums/billing/discount-type.enum';

/** A line of POST / PUT /billing/invoices: a price-list service or a free-text line with its own price. */
export interface InvoiceItemPayload {
  id?: string | null;
  billableServiceId?: string | null;
  description?: string | null;
  quantity: string;
  unitPrice?: string | null;
  discountType?: DiscountType | null;
  discountValue?: string | null;
  doctorId?: string | null;
}
