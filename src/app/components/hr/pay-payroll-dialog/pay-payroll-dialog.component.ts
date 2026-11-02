import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { PayPayrollDialogData } from '@interfaces/hr/dialog-data.interface';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { PayrollRun } from '@interfaces/hr/payroll.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { PayrollApi } from '@services/hr/payroll-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';

/** Record the bank transfer of an approved payroll (posts Dr salaries payable / Cr bank). */
@Component({
  selector: 'app-pay-payroll-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, TextField, MoneyPipe],
  templateUrl: './pay-payroll-dialog.component.html',
})
export class PayPayrollDialog {
  protected readonly data = inject<PayPayrollDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<PayPayrollDialog, PayrollRun>);
  private readonly api = inject(PayrollApi);

  protected readonly today = clinicIsoDate();
  protected readonly form = new FormGroup({
    paidOn: new FormControl(this.today, { nonNullable: true, validators: [Validators.required] }),
    reference: new FormControl<string | null>(null, [Validators.maxLength(100)]),
  });

  protected readonly submit = async (): Promise<PayrollRun> => {
    const v = this.form.getRawValue();
    const paid = await firstValueFrom(
      this.api.markPaid(this.data.run.id, v.paidOn, v.reference?.trim() || null),
    );
    this.ref.close(paid);
    return paid;
  };
}
