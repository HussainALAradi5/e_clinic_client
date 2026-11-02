import { DiscountType } from '@enums/billing/discount-type.enum';

/** What the invoice editor knows about a line before the server prices it. */
export interface LineDraft {
  quantity: string;
  unitPrice: string;
  discountType: DiscountType | null;
  discountValue: string;
  taxRate: string;
}
