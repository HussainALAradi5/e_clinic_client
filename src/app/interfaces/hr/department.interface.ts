import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { DepartmentRef } from '@interfaces/hr/department-ref.interface';

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
