/** GET /roles/permissions — permissions grouped by module. */
export interface PermissionGroup {
  module: string;
  permissions: { id: string; name: string; description: string | null }[];
}
