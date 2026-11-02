/** GET /roles/resources — protected resources (config/access.php). */
export interface ResourceAccess {
  resource: string;
  module: string;
  flags: string[];
  actions: string[];
  ownership: string;
}
