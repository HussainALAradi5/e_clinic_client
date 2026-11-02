import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { BrandSurface } from '@components/common/hub/brand-surface.component';
import { HubNav } from '@components/common/hub/hub-nav.component';
import { HOME_PATH } from '@constants/app.constants';
import { NavigationService } from '@services/ui/navigation.service';

/**
 * Generic hub of one menu group (`/system`, `/reference`, …): route data `{ hub: '/system' }` names the group;
 * its header and tiles come from the menu, filtered by the user's access. A new module only adds a route.
 */
@Component({
  selector: 'app-hub-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, MatButtonModule, BrandSurface, HubNav, EmptyState],
  templateUrl: './hub.page.html',
})
export class HubPage {
  /** Route data (component input binding). */
  readonly hub = input.required<string>();

  private readonly navigation = inject(NavigationService);
  protected readonly group = computed(() => this.navigation.group(this.hub()));
  protected readonly homePath = HOME_PATH;
}
