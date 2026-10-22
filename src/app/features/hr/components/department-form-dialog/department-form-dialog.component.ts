import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DepartmentFormDialogData } from '../../interfaces/dialog-data.interface';
import { EntitySelect } from '@shared/components/entity-select/entity-select.component';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { EmployeeStatus } from '@shared/enums/hr/employee-status.enum';
import { Department, DepartmentPayload } from '@shared/interfaces/hr/department.interface';
import { Employee } from '@shared/interfaces/hr/employee.interface';
import { FilterGroup } from '@shared/interfaces/list/list-query.interface';
import { dirtyPayload } from '@shared/utils/form-payload';

/** Create or edit a department: code, name, parent (never itself or below) and an active manager. */
@Component({
  selector: 'app-department-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, TextField, EntitySelect],
  templateUrl: './department-form-dialog.component.html',
})
export class DepartmentFormDialog {
  protected readonly data = inject<DepartmentFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<DepartmentFormDialog, Department>);
  protected readonly department = this.data.department;
  protected readonly parent = this.department?.parent ?? this.data.parent ?? null;
  protected readonly manager = this.department?.manager ?? null;

  protected readonly form = new FormGroup({
    code: new FormControl(this.department?.code ?? '', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z0-9_-]+$/),
      ],
    }),
    name: new FormControl(this.department?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    parentId: new FormControl<string | null>(
      this.department?.parentId ?? this.data.parent?.id ?? null,
    ),
    managerId: new FormControl<string | null>(this.department?.managerId ?? null),
    costCenterCode: new FormControl<string | null>(this.department?.costCenterCode ?? null, [
      Validators.maxLength(20),
    ]),
  });

  protected readonly departmentName = (d: Department): string => d.name;
  protected readonly departmentCode = (d: Department): string => d.code;
  protected readonly employeeName = (e: Employee | { fullName: string }): string => e.fullName;
  protected readonly employeeTitle = (e: Employee): string => e.jobTitle;
  protected readonly activeOnly: FilterGroup = { and: [{ status: { eq: EmployeeStatus.Active } }] };
  /** Other departments only. */
  protected readonly notSelf: FilterGroup | null = this.department
    ? { and: [{ id: { nin: [this.department.id] } }] }
    : null;

  private saved: Department | undefined;

  protected readonly submit = async (): Promise<Department> => {
    this.saved = await this.data.save(
      dirtyPayload(this.form, [], !this.department) as DepartmentPayload,
    );
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
