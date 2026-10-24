import { Role } from '@shared/interfaces/identity/role.interface';

/** The role to add people to; `add` saves and resolves with how many were added. */
export interface AddMembersDialogData {
  role: Role;
  add: (userIds: string[]) => Promise<number>;
}
