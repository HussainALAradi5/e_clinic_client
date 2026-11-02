import { FormControl, FormGroup } from '@angular/forms';
import { MedicationRoute } from '@enums/pharmacy/medication-route.enum';

export type ItemGroup = FormGroup<{
  medicationId: FormControl<string | null>;
  dose: FormControl<string>;
  frequency: FormControl<string>;
  route: FormControl<MedicationRoute>;
  durationDays: FormControl<number>;
  quantity: FormControl<string | null>;
  instructions: FormControl<string | null>;
}>;
