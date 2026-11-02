import { FormControl, FormGroup } from '@angular/forms';

export type LineGroup = FormGroup<{
  accountId: FormControl<string | null>;
  description: FormControl<string>;
  debit: FormControl<string | null>;
  credit: FormControl<string | null>;
}>;
