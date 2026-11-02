export interface UserRolesDialogData {
  current: string[];
  save: (roles: string[]) => Promise<unknown>;
}
