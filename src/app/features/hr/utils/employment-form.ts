import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EmploymentType } from '@shared/enums/hr/employment-type.enum';
import { DayOfWeek } from '@shared/enums/shared/day-of-week.enum';
import { Employee } from '@shared/interfaces/hr/employee.interface';
import { clinicIsoDate } from '@shared/utils/clinic-time';

export type EmploymentForm = FormGroup<{
  departmentId: FormControl<string | null>;
  jobTitle: FormControl<string>;
  employmentType: FormControl<EmploymentType | null>;
  hireDate: FormControl<string>;
  probationEndDate: FormControl<string | null>;
  workStartTime: FormControl<string>;
  workEndTime: FormControl<string>;
  weeklyOffDays: FormControl<number[]>;
  basicSalary: FormControl<string | null>;
  bankName: FormControl<string | null>;
  iban: FormControl<string | null>;
  socialInsuranceNumber: FormControl<string | null>;
}>;

/** Employment data of a hire (defaults: full time, 08:00–16:00, Friday + Saturday off) or of an employee. */
export function employmentForm(employee: Employee | null = null): EmploymentForm {
  return new FormGroup({
    departmentId: new FormControl<string | null>(employee?.departmentId ?? null, [
      Validators.required,
    ]),
    jobTitle: new FormControl(employee?.jobTitle ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    employmentType: new FormControl<EmploymentType | null>(
      employee?.employmentType ?? EmploymentType.FullTime,
      [Validators.required],
    ),
    hireDate: new FormControl(employee?.hireDate ?? clinicIsoDate(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    probationEndDate: new FormControl<string | null>(employee?.probationEndDate ?? null),
    workStartTime: new FormControl(employee?.workStartTime ?? '08:00', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    workEndTime: new FormControl(employee?.workEndTime ?? '16:00', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    weeklyOffDays: new FormControl(
      employee?.weeklyOffDays ?? [DayOfWeek.Friday, DayOfWeek.Saturday],
      { nonNullable: true },
    ),
    basicSalary: new FormControl<string | null>(
      employee?.basicSalary?.amount ?? null,
      employee ? [] : [Validators.required],
    ),
    bankName: new FormControl<string | null>(employee?.bankName ?? null, [
      Validators.maxLength(100),
    ]),
    iban: new FormControl<string | null>(null, [
      Validators.pattern(/^BH\s?\d{2}(\s?[A-Z0-9]){18}$/i),
    ]),
    socialInsuranceNumber: new FormControl<string | null>(employee?.socialInsuranceNumber ?? null, [
      Validators.maxLength(30),
    ]),
  });
}
