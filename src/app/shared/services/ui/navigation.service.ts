import { computed, inject, Injectable } from '@angular/core';
import { MENU } from '@shared/constants/menu.constants';
import { NavGroup } from '@shared/interfaces/ui/nav.interface';
import { AccessService } from '@shared/services/auth/access.service';

/** The menu as the signed-in user may see it: the side menu, the dashboard and every hub page read it from here. */
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly access = inject(AccessService);

  /** Groups with only the items the user may open; empty groups are dropped. */
  readonly menu = computed<NavGroup[]>(() =>
    MENU.map((group) => ({
      ...group,
      items: group.items.filter((item) => this.access.can(item.access)),
    })).filter((group) => group.items.length > 0),
  );

  /** Groups that have a hub page (the dashboard's own group has none). */
  readonly hubs = computed(() => this.menu().filter((group) => !!group.route));

  /** The visible group whose hub lives at `route`, or null when the user may open none of it. */
  group(route: string): NavGroup | null {
    return this.menu().find((group) => group.route === route) ?? null;
  }
}
