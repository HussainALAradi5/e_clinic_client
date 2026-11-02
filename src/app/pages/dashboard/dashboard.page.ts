import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BrandSurface } from '@components/common/hub/brand-surface.component';
import { HubNav } from '@components/common/hub/hub-nav.component';
import { ACCOUNT_SECURITY_PATH, DATE_FORMAT, TIME_FORMAT } from '@constants/app.constants';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { AuthStore } from '@services/auth/auth.store';
import { NavigationService } from '@services/ui/navigation.service';

/** `/dashboard` — greeting, account notices and a hub of every area the user may open (module widgets come later). */
@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterLink,
    DatePipe,
    EnumLabelPipe,
    BrandSurface,
    HubNav,
  ],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  protected readonly auth = inject(AuthStore);

  protected readonly securityPath = ACCOUNT_SECURITY_PATH;
  protected readonly dateTimeFormat = `${DATE_FORMAT}, ${TIME_FORMAT}`;
  protected readonly today = new Date();
  protected readonly greeting = computed(() => {
    const hour = this.today.getHours();
    const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${part}, ${this.auth.user()?.firstName ?? ''}`;
  });
  /** Every area with a hub page (the dashboard's own group is left out). */
  protected readonly areas = inject(NavigationService).hubs;
}
