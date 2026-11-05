import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { EARNINGS_TEXT } from '@constants/hr/doctor-earnings.constants';
import { CommissionType } from '@enums/hr/commission-type.enum';
import { DoctorEarning } from '@interfaces/hr/doctor-earning.interface';
import { DoctorEarningApi } from '@services/hr/doctor-earning-api.service';
import { AppValidators } from '@validations/validators';

/** A doctor's commission terms: none, a percent of their revenue (0–100) or an amount per completed visit. */
@Component({
  selector: 'app-commission-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, SelectField, TextField],
  templateUrl: './commission-dialog.component.html',
})
export class CommissionDialog {
  protected readonly row = inject<DoctorEarning>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<CommissionDialog, boolean>);
  private readonly api = inject(DoctorEarningApi);
  protected readonly text = EARNINGS_TEXT;
  protected readonly types = CommissionType;

  protected readonly form = new FormGroup({
    type: new FormControl<CommissionType>(this.row.commissionType, { nonNullable: true }),
    value: new FormControl<string | null>(
      this.row.commissionType === CommissionType.None ? null : this.row.rate,
      [
        AppValidators.requiredIf((c) => c.parent?.get('type')?.value !== CommissionType.None),
        Validators.min(0),
        (c) =>
          c.parent?.get('type')?.value === CommissionType.Percent && Number(c.value) > 100
            ? { max: { max: 100 } }
            : null,
      ],
    ),
  });
  protected readonly type = toSignal(this.form.controls.type.valueChanges, {
    initialValue: this.form.controls.type.value,
  });

  constructor() {
    this.form.controls.type.valueChanges.subscribe(() =>
      this.form.controls.value.updateValueAndValidity(),
    );
  }

  protected readonly submit = async (): Promise<boolean> => {
    const v = this.form.getRawValue();
    await firstValueFrom(
      this.api.setCommission(
        this.row.doctor.id,
        v.type,
        v.type === CommissionType.None ? null : String(v.value),
      ),
    );
    this.ref.close(true);
    return true;
  };
}
