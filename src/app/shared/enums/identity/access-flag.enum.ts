/** Mirror of Permission::FLAGS — the five access-matrix flags stored as `<resource>.<flag>` permissions. */
export enum AccessFlag {
  ReadOwn = 'read_own',
  ReadAll = 'read_all',
  Create = 'create',
  Write = 'write',
  Delete = 'delete',
}
