import { Employee } from '@interfaces/hr/employee.interface';

/** Edit employment data of an employee (salary fields only with employees.manage_salary). */
export interface EmploymentDialogData {
  employee: Employee;
  canManageSalary: boolean;
}
