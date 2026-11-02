import { FormControl, FormGroup } from '@angular/forms';

export type SaleLine = FormGroup<{
  medicationId: FormControl<string | null>;
  quantity: FormControl<string | null>;
}>;
