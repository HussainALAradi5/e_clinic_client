import { FormControl, FormGroup } from '@angular/forms';
import { MedicationRoute } from '@enums/pharmacy/medication-route.enum';

export type GivenGroup = FormGroup<{
  medicationId: FormControl<string | null>;
  quantity: FormControl<string | null>;
  route: FormControl<MedicationRoute>;
  dose: FormControl<string | null>;
}>;
