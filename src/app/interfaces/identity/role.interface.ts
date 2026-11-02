import { GenericEntity } from '@interfaces/common/generic-entity.interface';

/** Mirror of RoleResource. */
export interface Role extends GenericEntity {
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  usersCount: number | null;
  permissionsCount: number | null;
  /** Detail endpoint only. */
  permissions?: string[];
}
