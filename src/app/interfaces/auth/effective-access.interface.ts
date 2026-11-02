/** GET /roles/me/access (RoleService::effectiveAccess). */
export interface EffectiveAccess {
  roles: string[];
  permissions: string[];
}
