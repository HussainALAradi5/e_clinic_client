import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { catchError, firstValueFrom, of } from 'rxjs';
import { AppointmentDialogData } from '@interfaces/clinic/appointment-dialog-data.interface';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { CancelledBy } from '@enums/clinic/cancelled-by.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { AppointmentApi } from '@services/clinic/appointment-api.service';
import { EnumService } from '@services/data/enum.service';
import { MatIconModule } from '@angular/material/icon';
import { FEE_TEXT } from '@constants/billing/appointment-fee.constants';
import { AppointmentFeeApi } from '@services/billing/appointment-fee-api.service';
import { AccessService } from '@services/auth/access.service';
import { formatMoney } from '@utilities/money';
import { CANCEL_DIALOG_TEXT } from '@constants/clinic/cancel-dialog.constants';

/**
 * Cancel a pending / confirmed booking: who asked and why (the patient is told; the slot frees up). When the patient
 * asks this close to the visit, the late-cancellation fee is shown before confirming (the server charges it).
 */
@Component({
  selector: 'app-cancel-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatIconModule, GenericForm, SelectField, TextField],
  templateUrl: './cancel-dialog.component.html',
})
export class CancelDialog {
  protected readonly text = CANCEL_DIALOG_TEXT;

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

  /** The fee a patient-side cancellation would cost now (only those who see fees ask). */
  private readonly fee = toSignal(
    inject(AccessService).can('appointment_fees.read_all')
      ? inject(AppointmentFeeApi)
          .cancellationFee(this.data.appointment.id)
          .pipe(catchError(() => of(null)))
      : of(null),
    { initialValue: null },
  );
  private readonly by = toSignal(this.form.controls.cancelledBy.valueChanges, {
    initialValue: this.form.controls.cancelledBy.value,
  });
  protected readonly feeWarning = computed(() => {
    const fee = this.fee();
    return fee && this.by() === CancelledBy.Patient
      ? FEE_TEXT.cancelWarning(formatMoney(fee))
      : null;
  });

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
