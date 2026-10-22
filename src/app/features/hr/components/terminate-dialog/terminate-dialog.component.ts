import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { EmployeeDialogData } from '../../interfaces/dialog-data.interface';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { TerminationReason } from '@shared/enums/hr/termination-reason.enum';
import { Employee } from '@shared/interfaces/hr/employee.interface';
import { EmployeeApi } from '@shared/services/hr/employee-api.service';
import { clinicIsoDate } from '@shared/utils/clinic-time';

/** Ends employment: last working day and reason; the account is deactivated and a doctor stops taking bookings. */
@Component({
  selector: 'app-terminate-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, SelectField, TextField],
  templateUrl: './terminate-dialog.component.html',
})
export class TerminateDialog {
  protected readonly data = inject<EmployeeDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<TerminateDialog, Employee>);
  private readonly api = inject(EmployeeApi);

  protected readonly form = new FormGroup({
    terminationDate: new FormControl(clinicIsoDate(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    reason: new FormControl<TerminationReason | null>(null, [Validators.required]),
    notes: new FormControl<string | null>(null, [Validators.maxLength(1000)]),
  });
  private saved: Employee | undefined;

  protected readonly submit = async (): Promise<Employee> => {
    const v = this.form.getRawValue();
    this.saved = await firstValueFrom(
      this.api.terminate(this.data.employee.id, {
        terminationDate: v.terminationDate,
        reason: v.reason as TerminationReason,
        notes: v.notes?.trim() || null,
      }),
    );
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
