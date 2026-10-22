import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { EmploymentFields } from '../employment-fields/employment-fields.component';
import { EmploymentDialogData } from '../../interfaces/dialog-data.interface';
import { employmentForm } from '../../utils/employment-form';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { Employee, UpdateEmployeePayload } from '@shared/interfaces/hr/employee.interface';
import { EmployeeApi } from '@shared/services/hr/employee-api.service';
import { dirtyPayload } from '@shared/utils/form-payload';

/** Edit employment data (only changed fields, with the version read — 409 when someone else saved first). */
@Component({
  selector: 'app-employment-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, EmploymentFields],
  templateUrl: './employment-dialog.component.html',
})
export class EmploymentDialog {
  protected readonly data = inject<EmploymentDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<EmploymentDialog, Employee>);
  private readonly api = inject(EmployeeApi);
  protected readonly form = employmentForm(this.data.employee);
  private saved: Employee | undefined;

  protected readonly submit = async (): Promise<Employee> => {
    const changes = dirtyPayload(
      this.form,
      this.data.canManageSalary ? [] : ['basicSalary', 'bankName', 'iban', 'socialInsuranceNumber'],
    );
    if (typeof changes['iban'] === 'string')
      changes['iban'] = changes['iban'].replace(/\s/g, '').toUpperCase();
    if (changes['iban'] === null) delete changes['iban'];
    const payload = { ...changes, version: this.data.employee.version } as UpdateEmployeePayload;
    this.saved = await firstValueFrom(this.api.update(this.data.employee.id, payload));
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
