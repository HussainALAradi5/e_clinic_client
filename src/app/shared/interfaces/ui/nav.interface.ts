/** Side-menu entry; shown when `access` (permission expression) is true for the signed-in user. */
export interface NavItem {
  label: string;
  icon: string;
  route: string;
  access: string;
  /** One line on what the area is for (hub tiles). */
  description?: string;
  /** Match child routes too (default) or only the exact URL. */
  exact?: boolean;
}

/** A menu group; with `route` it also has a hub page listing its items as tiles. */
export interface NavGroup {
  label: string;
  items: NavItem[];
  route?: string;
  icon?: string;
  description?: string;
}
