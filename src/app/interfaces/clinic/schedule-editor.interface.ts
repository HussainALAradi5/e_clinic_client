import { FormControl, FormGroup } from '@angular/forms';

export type BlockForm = FormGroup<{
  dayOfWeek: FormControl<number>;
  startTime: FormControl<string>;
  endTime: FormControl<string>;
  slotMinutes: FormControl<number | null>;
}>;
