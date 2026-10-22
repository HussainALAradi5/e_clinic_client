import { Department, DepartmentPayload } from '@shared/interfaces/hr/department.interface';
import { Employee } from '@shared/interfaces/hr/employee.interface';
import { LeaveType } from '@shared/interfaces/hr/leave.interface';
import { PayrollRun } from '@shared/interfaces/hr/payroll.interface';

/** New department (optional preset parent) or edit; closes with the saved department. */
export interface DepartmentFormDialogData {
  department: Department | null;
  parent?: Department | null;
  save: (payload: DepartmentPayload) => Promise<Department>;
}

/** Edit employment data of an employee (salary fields only with employees.manage_salary). */
export interface EmploymentDialogData {
  employee: Employee;
  canManageSalary: boolean;
}

/** Terminate or add a salary component for an employee. */
export interface EmployeeDialogData {
  employee: Employee;
}

/** Leave for the signed-in employee, or (HR) for the given one — e.g. recording leave already taken. */
export interface LeaveRequestDialogData {
  employee: { id: string; fullName: string } | null;
}

/** Correct one day of an employee (preset employee / date when opened from a row). */
export interface ManualAttendanceDialogData {
  employee: { id: string; fullName: string } | null;
  date: string | null;
}

/** New leave type or edit. */
export interface LeaveTypeDialogData {
  type: LeaveType | null;
}

/** Mark an approved payroll as paid. */
export interface PayPayrollDialogData {
  run: PayrollRun;
}
