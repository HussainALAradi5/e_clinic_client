import { FormControl, FormGroup } from '@angular/forms';
import { EmploymentType } from '@enums/hr/employment-type.enum';

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
