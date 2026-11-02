import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AppointmentDialogData } from '@interfaces/clinic/dialog-data.interface';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { CancelledBy } from '@enums/clinic/cancelled-by.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { AppointmentApi } from '@services/clinic/appointment-api.service';
import { EnumService } from '@services/data/enum.service';

/** Cancel a pending / confirmed booking: who asked and why (the patient is told; the slot frees up). */
@Component({
  selector: 'app-cancel-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, SelectField, TextField],
  templateUrl: './cancel-dialog.component.html',
})
export class CancelDialog {
  protected readonly data = inject<AppointmentDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<CancelDialog, Appointment>);
  private readonly api = inject(AppointmentApi);

  protected readonly who = inject(EnumService)
    .options('CancelledBy')
    .filter((o) => o.value !== CancelledBy.System);
  protected readonly form = new FormGroup({
    cancelledBy: new FormControl<CancelledBy>(CancelledBy.Patient, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });
  private saved: Appointment | undefined;

  protected readonly submit = async (): Promise<Appointment> => {
    const v = this.form.getRawValue();
    this.saved = await firstValueFrom(
      this.api.cancel(this.data.appointment.id, {
        cancelledBy: v.cancelledBy,
        reason: v.reason.trim(),
      }),
    );
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
