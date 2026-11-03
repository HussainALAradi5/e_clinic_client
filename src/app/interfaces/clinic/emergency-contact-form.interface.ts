import { FormArray, FormControl, FormGroup } from '@angular/forms';

/** One contact row of the form. */
export type EmergencyContactForm = FormGroup<{
  name: FormControl<string | null>;
  relation: FormControl<string | null>;
  phone: FormControl<string>;
}>;

/** Up to three contact rows. */
export type EmergencyContactsForm = FormArray<EmergencyContactForm>;
