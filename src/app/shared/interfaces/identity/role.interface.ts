import { GenericEntity } from '@shared/interfaces/common/generic-entity.interface';

/** Mirror of RoleResource. */
export interface Role extends GenericEntity {
  name: string;
  displayName: string;
  displayNameAr: string | null;
  description: string | null;
  isSystem: boolean;
  usersCount: number | null;
  permissionsCount: number | null;
  /** Detail endpoint only. */
  permissions?: string[];
}

/** POST /roles and PUT /roles/{role}. System roles accept labels only. */
export interface RolePayload {
  name?: string;
  displayName?: string;
  displayNameAr?: string | null;
  description?: string | null;
  permissions?: string[];
}

/** GET /roles/permissions — permissions grouped by module. */
export interface PermissionGroup {
  module: string;
  permissions: { id: string; name: string; description: string | null }[];
}

/** GET /roles/resources — protected resources (config/access.php). */
export interface ResourceAccess {
  resource: string;
  module: string;
  flags: string[];
  actions: string[];
  ownership: string;
}

/** One access-matrix row (GET / PUT /roles/{role}/access). */
export interface AccessRow {
  resource: string;
  module: string;
  readOwn: boolean;
  readAll: boolean;
  create: boolean;
  write: boolean;
  delete: boolean;
  /** Granted special actions (without the resource prefix). */
  actions: string[];
  availableActions: string[];
}

/** PUT /roles/users/{user}. */
export interface SyncUserRolesPayload {
  roles: string[];
}
