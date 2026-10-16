import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PersonFormDialogData } from '../../interfaces/dialog-data.interface';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { Gender } from '@shared/enums/shared/gender.enum';
import { EnumOption } from '@shared/interfaces/common/enum-meta.interface';
import { PersonPayload } from '@shared/interfaces/identity/person.interface';
import { AppValidators } from '@shared/utils/validators';

const LANGUAGES: EnumOption[] = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
];

/**
 * Edits personal data once for every role of the person (patient file, HR, account). Sends only changed fields
 * with the version read (409 CONCURRENT_MODIFICATION when someone else saved first).
 */
@Component({
  selector: 'app-person-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, TextField, SelectField],
  templateUrl: './person-form-dialog.component.html',
})
export class PersonFormDialog {
  protected readonly data = inject<PersonFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<PersonFormDialog>);
  protected readonly languages = LANGUAGES;

  private readonly person = this.data.person;
  protected readonly form = new FormGroup({
    firstName: new FormControl(this.person.firstName, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    lastName: new FormControl(this.person.lastName, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    firstNameAr: new FormControl(this.person.firstNameAr, [Validators.maxLength(100)]),
    lastNameAr: new FormControl(this.person.lastNameAr, [Validators.maxLength(100)]),
    gender: new FormControl<Gender>(this.person.gender, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    dateOfBirth: new FormControl(this.person.dateOfBirth, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    /** Blank keeps the stored (encrypted) value; the server only returns it masked. */
    nationalId: new FormControl<string | null>(null, [Validators.maxLength(30)]),
    phone: new FormControl(this.person.phone, {
      nonNullable: true,
      validators: [Validators.required, AppValidators.phone],
    }),
    email: new FormControl(this.person.email, [Validators.email, Validators.maxLength(255)]),
    language: new FormControl<string>(this.person.language, { nonNullable: true }),
  });

  protected readonly submit = (): Promise<unknown> => {
    const payload: Record<string, unknown> = { version: this.person.version };
    for (const [key, control] of Object.entries(this.form.controls)) {
      if (control.dirty && !(key === 'nationalId' && !control.value)) {
        payload[key] =
          typeof control.value === 'string' ? control.value.trim() || null : control.value;
      }
    }
    return this.data.save(payload as unknown as PersonPayload);
  };
}
