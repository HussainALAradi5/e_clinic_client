import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { EmployeeDialogData } from '@interfaces/hr/employee-dialog-data.interface';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { MoneyInput } from '@components/common/money-input/money-input.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { SalaryComponentType } from '@enums/hr/salary-component-type.enum';
import { SalaryComponent } from '@interfaces/hr/salary-component.interface';
import { EmployeeApi } from '@services/hr/employee-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';

/** Recurring monthly allowance or deduction applied by payroll. */
@Component({
  selector: 'app-salary-component-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    GenericForm,
    SelectField,
    TextField,
    MoneyInput,
  ],
  templateUrl: './salary-component-dialog.component.html',
})
export class SalaryComponentDialog {
  protected readonly data = inject<EmployeeDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<SalaryComponentDialog, SalaryComponent>);
  private readonly api = inject(EmployeeApi);

  protected readonly form = new FormGroup({
    type: new FormControl<SalaryComponentType | null>(SalaryComponentType.Allowance, [
      Validators.required,
    ]),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    amount: new FormControl<string | null>(null, [Validators.required]),
    effectiveFrom: new FormControl(clinicIsoDate(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    effectiveTo: new FormControl<string | null>(null),
    isTaxable: new FormControl(false, { nonNullable: true }),
  });
  private saved: SalaryComponent | undefined;

  protected readonly submit = async (): Promise<SalaryComponent> => {
    const v = this.form.getRawValue();
    this.saved = await firstValueFrom(
      this.api.addSalaryComponent(this.data.employee.id, {
        type: v.type as SalaryComponentType,
        name: v.name.trim(),
        amount: v.amount as string,
        effectiveFrom: v.effectiveFrom,
        effectiveTo: v.effectiveTo || null,
        isTaxable: v.isTaxable,
      }),
    );
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
