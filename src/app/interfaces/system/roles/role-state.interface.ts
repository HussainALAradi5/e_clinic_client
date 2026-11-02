import { ApiError } from '@interfaces/api/api-error.interface';
import { AccessRow } from '@interfaces/identity/access-row.interface';
import { Role } from '@interfaces/identity/role.interface';

/** RoleStore state. */
export interface RoleState {
  role: Role | null;
  matrix: AccessRow[];
  loading: boolean;
  error: ApiError | null;
}
