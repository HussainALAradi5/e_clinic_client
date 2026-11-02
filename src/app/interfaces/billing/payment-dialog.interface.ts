import { FormControl, FormGroup } from '@angular/forms';
import { PaymentMethod } from '@enums/shared/payment-method.enum';

export type PaymentRow = FormGroup<{
  method: FormControl<PaymentMethod>;
  amount: FormControl<string | null>;
  tendered: FormControl<string | null>;
  referenceNumber: FormControl<string | null>;
  cardLast4: FormControl<string | null>;
}>;
