import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { EnumOption } from '@interfaces/common/enum-option.interface';
import { PayrollRun } from '@interfaces/hr/payroll-run.interface';
import { PayrollApi } from '@services/hr/payroll-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { PAYROLL_RUN_DIALOG_TEXT } from '@constants/hr/payroll-run-dialog.constants';

/** Open the payroll of a month (last month by default); it is calculated once the month has ended. */
@Component({
  selector: 'app-payroll-run-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, SelectField],
  templateUrl: './payroll-run-dialog.component.html',
})
export class PayrollRunDialog {
  protected readonly ref = inject(MatDialogRef<PayrollRunDialog, PayrollRun>);
  private readonly api = inject(PayrollApi);

  protected readonly text = PAYROLL_RUN_DIALOG_TEXT;
  /** The last twelve months, most recent first (value `YYYY-MM`). */
  protected readonly months: EnumOption<string>[] = Array.from({ length: 12 }, (_, i) => {
    const [y, m] = clinicIsoDate().split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    return {
      value: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    };
  });
  protected readonly form = new FormGroup({
    month: new FormControl(this.months[1].value, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly submit = async (): Promise<PayrollRun> => {
    const [year, month] = this.form.getRawValue().month.split('-').map(Number);
    const run = await firstValueFrom(this.api.create(year, month));
    this.ref.close(run);
    return run;
  };
}
