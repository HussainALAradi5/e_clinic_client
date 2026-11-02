import { EmployeeStatus } from '@enums/hr/employee-status.enum';
import { EmploymentType } from '@enums/hr/employment-type.enum';
import { TerminationReason } from '@enums/hr/termination-reason.enum';
import { UserStatus } from '@enums/identity/user-status.enum';
import { UserType } from '@enums/identity/user-type.enum';
import { Versioned } from '@interfaces/common/versioned.interface';
import { Money } from '@interfaces/common/money.interface';
import { DepartmentRef } from '@interfaces/hr/department-ref.interface';
import { SalaryComponent } from '@interfaces/hr/salary-component.interface';
import { Person } from '@interfaces/identity/person.interface';

/** Mirror of EmployeeResource. Salary fields only with `employees.view_salary`. */
export interface Employee extends Versioned {
  id: string;
  code: string;
  fullName: string;
  person: Person;
  account?: { userType: UserType; status: UserStatus; roles: string[] };
  departmentId: string;
  department?: DepartmentRef;
  jobTitle: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  hireDate: string;
  probationEndDate: string | null;
  terminationDate: string | null;
  terminationReason: TerminationReason | null;
  workStartTime: string;
  workEndTime: string;
  weeklyOffDays: number[];
  basicSalary?: Money;
  bankName?: string | null;
  iban?: string | null;
  socialInsuranceNumber?: string | null;
  salaryComponents?: SalaryComponent[];
  createdAt: string;
  updatedAt: string;
}
