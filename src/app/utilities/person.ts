import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Gender } from '@enums/shared/gender.enum';
import { NewPersonPayload } from '@interfaces/identity/new-person-payload.interface';
import { AppValidators } from '@validations/validators';
import { NewPersonForm } from '@interfaces/common/person.interface';

/** Form of a new person registered inside another record (patient file, hire). Staff need a national ID. */
export function newPersonForm(staff = false): NewPersonForm {
  return new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    gender: new FormControl<Gender | null>(null, [Validators.required]),
    dateOfBirth: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nationalId: new FormControl<string | null>(null, [
      Validators.maxLength(30),
      ...(staff ? [Validators.required] : []),
    ]),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, AppValidators.phone],
    }),
    email: new FormControl<string | null>(null, [Validators.email, Validators.maxLength(255)]),
    nationalityCode: new FormControl<string | null>('BH'),
  });
}

/** Trimmed payload of a new-person form (blank optional fields are left out). */
export function toNewPerson(form: NewPersonForm): NewPersonPayload {
  const v = form.getRawValue();
  const blank = (value: string | null): string | null => value?.trim() || null;

  return {
    firstName: v.firstName.trim(),
    lastName: v.lastName.trim(),
    gender: v.gender as Gender,
    dateOfBirth: v.dateOfBirth,
    nationalId: blank(v.nationalId),
    nationalityCode: v.nationalityCode,
    phone: v.phone.trim(),
    email: blank(v.email),
  };
}
