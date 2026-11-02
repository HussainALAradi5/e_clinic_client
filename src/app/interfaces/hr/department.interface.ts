import { GenericEntity } from '@interfaces/common/generic-entity.interface';

/** Short reference to a department. */
export interface DepartmentRef {
  id: string;
  code?: string;
  name: string;
}

/** Mirror of DepartmentResource — a node of the department tree. */
export interface Department extends GenericEntity {
  name: string;
  nameAr: string | null;
  parentId: string | null;
  parent?: DepartmentRef | null;
  managerId: string | null;
  manager?: { id: string; fullName: string; jobTitle: string } | null;
  costCenterCode: string | null;
  employeesCount?: number;
  children?: Department[];
}

/** POST / PUT /hr/departments. */
export interface DepartmentPayload {
  code?: string;
  name?: string;
  nameAr?: string | null;
  parentId?: string | null;
  managerId?: string | null;
  costCenterCode?: string | null;
}
