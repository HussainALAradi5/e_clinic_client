import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { EnumOption } from '@shared/interfaces/common/enum-meta.interface';
import { PayrollRun } from '@shared/interfaces/hr/payroll.interface';
import { PayrollApi } from '@shared/services/hr/payroll-api.service';
import { clinicIsoDate } from '@shared/utils/clinic-time';

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
