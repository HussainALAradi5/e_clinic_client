import { Department } from '@interfaces/hr/department.interface';
import { DepartmentPayload } from '@interfaces/hr/department-payload.interface';

/** New department (optional preset parent) or edit; closes with the saved department. */
export interface DepartmentFormDialogData {
  department: Department | null;
  parent?: Department | null;
  save: (payload: DepartmentPayload) => Promise<Department>;
}
