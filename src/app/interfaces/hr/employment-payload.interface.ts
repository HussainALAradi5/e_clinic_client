import { EmploymentType } from '@enums/hr/employment-type.enum';

/** Employment data of POST / PUT /hr/employees. */
export interface EmploymentPayload {
  departmentId?: string;
  jobTitle?: string;
  employmentType?: EmploymentType;
  hireDate?: string;
  probationEndDate?: string | null;
  workStartTime?: string;
  workEndTime?: string;
  weeklyOffDays?: number[];
  basicSalary?: string;
  bankName?: string | null;
  iban?: string | null;
  socialInsuranceNumber?: string | null;
}
