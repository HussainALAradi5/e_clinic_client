import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CountryFormDialogData } from '@interfaces/reference/country-form-dialog-data.interface';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { Country } from '@interfaces/reference/country.interface';
import { CountryPayload } from '@interfaces/reference/country-payload.type';
import { Flag } from '@components/common/flag/flag.component';

/** Edits a country's labels, dial code, picker order and active flag (deactivating keeps existing data). */
@Component({
  selector: 'app-country-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Flag,
    MatDialogModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    GenericForm,
    TextField,
  ],
  templateUrl: './country-form-dialog.component.html',
})
export class CountryFormDialog {
  protected readonly data = inject<CountryFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<CountryFormDialog, Country>);
  private readonly country = this.data.country;

  protected readonly form = new FormGroup({
    name: new FormControl(this.country.name, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    nationality: new FormControl(this.country.nationality, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    phoneCode: new FormControl(this.country.phoneCode, {
      nonNullable: true,
      validators: [Validators.pattern(/^\+\d{1,5}$/)],
    }),
    sortOrder: new FormControl(this.country.sortOrder, {
      nonNullable: true,
      validators: [Validators.min(0), Validators.max(1000)],
    }),
    isActive: new FormControl(this.country.isActive, { nonNullable: true }),
  });

  private saved: Country | undefined;

  protected readonly submit = async (): Promise<Country> => {
    const payload: Record<string, unknown> = {};
    for (const [key, control] of Object.entries(this.form.controls)) {
      if (control.dirty) {
        payload[key] = key === 'sortOrder' ? Number(control.value) : control.value;
      }
    }
    this.saved = await this.data.save(payload as CountryPayload);
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
