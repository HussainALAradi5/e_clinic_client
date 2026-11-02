import { FormControl, FormGroup } from '@angular/forms';
import { DiscountType } from '@enums/billing/discount-type.enum';

export /** One editable line: a price-list service (priced by the server) or a free-text line with its own price. */
type LineGroup = FormGroup<{
  id: FormControl<string | null>;
  billableServiceId: FormControl<string | null>;
  label: FormControl<string>;
  source: FormControl<string | null>;
  description: FormControl<string>;
  quantity: FormControl<string>;
  unitPrice: FormControl<string | null>;
  discountType: FormControl<DiscountType | null>;
  discountValue: FormControl<string | null>;
  taxRate: FormControl<string>;
}>;
