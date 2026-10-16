import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { AccessRow, Role } from '@shared/interfaces/identity/role.interface';

/** RoleStore state. */
export interface RoleState {
  role: Role | null;
  matrix: AccessRow[];
  loading: boolean;
  error: ApiError | null;
}
