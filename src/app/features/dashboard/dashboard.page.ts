import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ACCOUNT_SECURITY_PATH, DATE_FORMAT, TIME_FORMAT } from '@shared/constants/app.constants';
import { MENU } from '@shared/constants/menu.constants';
import { NavGroup, NavItem } from '@shared/interfaces/ui/nav.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { AccessService } from '@shared/services/auth/access.service';
import { AuthStore } from '@shared/services/auth/auth.store';

const DASHBOARD_ROUTE = '/dashboard';

/** `/dashboard` — greeting, account notices and shortcuts to every area the user may open (module widgets come later). */
@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule, RouterLink, DatePipe, EnumLabelPipe],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  protected readonly auth = inject(AuthStore);
  private readonly access = inject(AccessService);

  protected readonly securityPath = ACCOUNT_SECURITY_PATH;
  protected readonly dateTimeFormat = `${DATE_FORMAT}, ${TIME_FORMAT}`;
  protected readonly greeting = computed(() => {
    const hour = new Date().getHours();
    const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${part}, ${this.auth.user()?.firstName ?? ''}`;
  });
  protected readonly today = new Date();
  /** Menu groups the user may open, without the dashboard itself. */
  protected readonly areas = computed<NavGroup[]>(() =>
    MENU.map((group) => ({
      ...group,
      items: group.items.filter(
        (item: NavItem) => item.route !== DASHBOARD_ROUTE && this.access.can(item.access),
      ),
    })).filter((group) => group.items.length > 0),
  );
}
