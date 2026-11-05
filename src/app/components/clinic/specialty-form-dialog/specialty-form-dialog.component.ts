import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SpecialtyFormDialogData } from '@interfaces/clinic/specialty-form-dialog-data.interface';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { Specialty } from '@interfaces/clinic/specialty.interface';
import { SpecialtyPayload } from '@interfaces/clinic/specialty-payload.interface';
import { dirtyPayload } from '@utilities/form-payload';
import { SPECIALTY_FORM_DIALOG_TEXT } from '@constants/clinic/specialty-form-dialog.constants';

/** Create or edit a specialty (unique short code). */
@Component({
  selector: 'app-specialty-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, TextField],
  templateUrl: './specialty-form-dialog.component.html',
})
export class SpecialtyFormDialog {
  protected readonly text = SPECIALTY_FORM_DIALOG_TEXT;

  protected readonly data = inject<SpecialtyFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<SpecialtyFormDialog, Specialty>);
  protected readonly specialty = this.data.specialty;
  protected readonly form = new FormGroup({
    code: new FormControl(this.specialty?.code ?? '', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z0-9_-]+$/),
      ],
    }),
    name: new FormControl(this.specialty?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    description: new FormControl<string | null>(this.specialty?.description ?? null, [
      Validators.maxLength(2000),
    ]),
  });
  private saved: Specialty | undefined;

  protected readonly submit = async (): Promise<Specialty> => {
    this.saved = await this.data.save(
      dirtyPayload(this.form, [], !this.specialty) as SpecialtyPayload,
    );
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
