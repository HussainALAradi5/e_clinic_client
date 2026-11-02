/** POST / PUT /hr/departments. */
export interface DepartmentPayload {
  code?: string;
  name?: string;
  nameAr?: string | null;
  parentId?: string | null;
  managerId?: string | null;
  costCenterCode?: string | null;
}
