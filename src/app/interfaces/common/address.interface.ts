import { FormControl, FormGroup } from '@angular/forms';

export type AddressForm = FormGroup<{
  countryCode: FormControl<string>;
  flat: FormControl<string | null>;
  building: FormControl<string | null>;
  road: FormControl<string | null>;
  block: FormControl<string | null>;
  area: FormControl<string | null>;
  city: FormControl<string | null>;
  governorate: FormControl<string | null>;
  postalCode: FormControl<string | null>;
  line1: FormControl<string | null>;
  line2: FormControl<string | null>;
}>;
