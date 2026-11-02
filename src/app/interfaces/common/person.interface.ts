import { FormControl, FormGroup } from '@angular/forms';
import { Gender } from '@enums/shared/gender.enum';

export type NewPersonForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  gender: FormControl<Gender | null>;
  dateOfBirth: FormControl<string>;
  nationalId: FormControl<string | null>;
  phone: FormControl<string>;
  email: FormControl<string | null>;
  nationalityCode: FormControl<string | null>;
}>;
