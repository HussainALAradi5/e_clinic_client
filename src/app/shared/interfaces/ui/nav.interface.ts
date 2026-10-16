/** Side-menu entry; shown when `access` (permission expression) is true for the signed-in user. */
export interface NavItem {
  label: string;
  icon: string;
  route: string;
  access: string;
  /** Match child routes too (default) or only the exact URL. */
  exact?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
