import { Role, RolePayload } from '@interfaces/identity/role.interface';

/** New role (no `role`) or edit labels of an existing one; the dialog closes with the saved role. */
export interface RoleFormDialogData {
  role: Role | null;
  save: (payload: RolePayload) => Promise<Role>;
}
