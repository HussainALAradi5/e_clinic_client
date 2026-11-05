import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ManualAttendanceDialogData } from '@interfaces/hr/manual-attendance-dialog-data.interface';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { AttendanceStatus } from '@enums/hr/attendance-status.enum';
import { EmployeeStatus } from '@enums/hr/employee-status.enum';
import { Attendance } from '@interfaces/hr/attendance.interface';
import { Employee } from '@interfaces/hr/employee.interface';
import { FilterGroup } from '@interfaces/list/filter-group.interface';
import { EnumService } from '@services/data/enum.service';
import { AttendanceApi } from '@services/hr/attendance-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { AppValidators } from '@validations/validators';
import { MANUAL_ATTENDANCE_DIALOG_TEXT } from '@constants/hr/manual-attendance-dialog.constants';

/** HR correction of one day: the times worked, or what the day was (absent, on leave, holiday …). */
@Component({
  selector: 'app-manual-attendance-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    GenericForm,
    EntitySelect,
    SelectField,
    TextField,
  ],
  templateUrl: './manual-attendance-dialog.component.html',
})
export class ManualAttendanceDialog {
  protected readonly text = MANUAL_ATTENDANCE_DIALOG_TEXT;

  protected readonly data = inject<ManualAttendanceDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<ManualAttendanceDialog, Attendance>);
  private readonly api = inject(AttendanceApi);

  protected readonly today = clinicIsoDate();
  protected readonly dayResults = inject(EnumService)
    .options('AttendanceStatus')
    .filter((o) => o.value !== AttendanceStatus.Present && o.value !== AttendanceStatus.Late);
  protected readonly activeOnly: FilterGroup = {
    and: [{ status: { eq: EmployeeStatus.Active } }],
  };
  protected readonly employeeName = (e: Employee | { fullName: string }): string => e.fullName;
  protected readonly employeeTitle = (e: Employee): string => e.jobTitle;

  protected readonly form = new FormGroup({
    employeeId: new FormControl<string | null>(this.data.employee?.id ?? null, [
      Validators.required,
    ]),
    date: new FormControl(this.data.date ?? this.today, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    mode: new FormControl<'times' | 'day'>('times', { nonNullable: true }),
    checkIn: new FormControl<string | null>(
      null,
      AppValidators.requiredIf((c) => c.parent?.get('mode')?.value === 'times'),
    ),
    checkOut: new FormControl<string | null>(null, [AppValidators.dateAfter('checkIn', false)]),
    status: new FormControl<AttendanceStatus | null>(
      AttendanceStatus.Absent,
      AppValidators.requiredIf((c) => c.parent?.get('mode')?.value === 'day'),
    ),
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });
  protected readonly mode = toSignal(this.form.controls.mode.valueChanges, {
    initialValue: 'times' as const,
  });

  constructor() {
    this.form.controls.mode.valueChanges.subscribe(() => {
      this.form.controls.checkIn.updateValueAndValidity();
      this.form.controls.status.updateValueAndValidity();
    });
  }

  protected readonly submit = async (): Promise<Attendance> => {
    const v = this.form.getRawValue();
    const times = v.mode === 'times';
    const saved = await firstValueFrom(
      this.api.record({
        employeeId: v.employeeId as string,
        date: v.date,
        checkIn: times ? v.checkIn : null,
        checkOut: times ? v.checkOut || null : null,
        status: times ? null : v.status,
        reason: v.reason.trim(),
      }),
    );
    this.ref.close(saved);
    return saved;
  };
}
