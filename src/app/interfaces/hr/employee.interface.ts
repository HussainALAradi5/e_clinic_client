import { DepartmentRef } from './department.interface';
import { EmployeeStatus } from '@enums/hr/employee-status.enum';
import { EmploymentType } from '@enums/hr/employment-type.enum';
import { SalaryComponentType } from '@enums/hr/salary-component-type.enum';
import { TerminationReason } from '@enums/hr/termination-reason.enum';
import { UserStatus } from '@enums/identity/user-status.enum';
import { UserType } from '@enums/identity/user-type.enum';
import { Versioned } from '@interfaces/common/generic-entity.interface';
import { Money } from '@interfaces/common/money.interface';
import { NewPersonPayload, Person } from '@interfaces/identity/person.interface';

/** Mirror of SalaryComponentResource — recurring allowance / deduction. */
export interface SalaryComponent {
  id: string;
  code: string;
  type: SalaryComponentType;
  name: string;
  amount: Money;
  effectiveFrom: string;
  effectiveTo: string | null;
  isTaxable: boolean;
}

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

/** POST /hr/employees — hire an existing person (`personId`) or a new one, with the account to create. */
export interface HireEmployeePayload extends EmploymentPayload {
  personId?: string;
  person?: NewPersonPayload;
  userType: UserType;
  roles: string[];
  canLogin: boolean;
}

/** PUT /hr/employees/{id}. */
export interface UpdateEmployeePayload extends EmploymentPayload {
  version: number;
}

/** POST /hr/employees/{id}/terminate. */
export interface TerminationPayload {
  terminationDate: string;
  reason: TerminationReason;
  notes?: string | null;
}

/** POST /hr/employees/{id}/salary-components. */
export interface SalaryComponentPayload {
  type: SalaryComponentType;
  name: string;
  amount: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isTaxable?: boolean;
}
