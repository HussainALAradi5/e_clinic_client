import { NavItem } from '@interfaces/ui/nav.interface';

/** A menu group; with `route` it also has a hub page listing its items as tiles. */
export interface NavGroup {
  label: string;
  items: NavItem[];
  route?: string;
  icon?: string;
  description?: string;
}
