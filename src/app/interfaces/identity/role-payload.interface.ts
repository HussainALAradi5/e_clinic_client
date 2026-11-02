/** POST /roles and PUT /roles/{role}. System roles accept labels only. */
export interface RolePayload {
  name?: string;
  displayName?: string;
  description?: string | null;
  permissions?: string[];
}
