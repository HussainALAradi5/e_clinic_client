import { FormControl } from '@angular/forms';

/** Controls of one row in the overtime time bands list. */
export interface OvertimeBandForm {
  start: FormControl<string | null>;
  end: FormControl<string | null>;
  rate: FormControl<string | null>;
}
