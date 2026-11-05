import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { FiscalYear } from '@interfaces/accounting/fiscal-year.interface';
import { FiscalApi } from '@services/accounting/fiscal-api.service';
import { AppValidators } from '@validations/validators';
import { FISCAL_YEAR_DIALOG_TEXT } from '@constants/accounting/fiscal-year-dialog.constants';

/** A new fiscal year split into monthly periods (plus an optional one-day adjustment period at year end). */
@Component({
  selector: 'app-fiscal-year-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatCheckboxModule, ReactiveFormsModule, GenericForm, TextField],
  templateUrl: './fiscal-year-dialog.component.html',
})
export class FiscalYearDialog {
  protected readonly ref = inject(MatDialogRef<FiscalYearDialog, FiscalYear>);
  private readonly api = inject(FiscalApi);

  protected readonly text = FISCAL_YEAR_DIALOG_TEXT;
  private readonly next = new Date().getFullYear() + 1;
  protected readonly form = new FormGroup({
    name: new FormControl(`FY${this.next}`, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20)],
    }),
    startDate: new FormControl(`${this.next}-01-01`, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    endDate: new FormControl(`${this.next}-12-31`, {
      nonNullable: true,
      validators: [Validators.required, AppValidators.dateAfter('startDate', false)],
    }),
    withAdjustmentPeriod: new FormControl(true, { nonNullable: true }),
  });

  protected readonly submit = async (): Promise<FiscalYear> => {
    const year = await firstValueFrom(this.api.create(this.form.getRawValue()));
    this.ref.close(year);
    return year;
  };
}
