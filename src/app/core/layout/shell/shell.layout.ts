import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { NotificationBell } from '../notification-bell/notification-bell.component';
import { ACCOUNT_SECURITY_PATH } from '@shared/constants/app.constants';
import { MENU } from '@shared/constants/menu.constants';
import { ThemeMode } from '@shared/enums/ui/theme.enum';
import { NavGroup } from '@shared/interfaces/ui/nav.interface';
import { AccessService } from '@shared/services/auth/access.service';
import { AuthStore } from '@shared/services/auth/auth.store';
import { SessionService } from '@shared/services/auth/session.service';
import { EnumService } from '@shared/services/data/enum.service';
import { ThemeService } from '@shared/services/ui/theme.service';

const THEME_ORDER: ThemeMode[] = [ThemeMode.System, ThemeMode.Light, ThemeMode.Dark];
const THEME_ICONS: Record<ThemeMode, string> = {
  [ThemeMode.System]: 'brightness_auto',
  [ThemeMode.Light]: 'light_mode',
  [ThemeMode.Dark]: 'dark_mode',
};

/**
 * Staff app frame: toolbar (menu toggle, notifications, theme, user menu) + side menu filtered by AccessService.
 * The menu is a side panel on desktop and an overlay on small screens.
 */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    NotificationBell,
  ],
  templateUrl: './shell.layout.html',
})
export class ShellLayout {
  protected readonly auth = inject(AuthStore);
  protected readonly theme = inject(ThemeService);
  private readonly access = inject(AccessService);
  private readonly session = inject(SessionService);

  protected readonly securityPath = ACCOUNT_SECURITY_PATH;
  protected readonly handset = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 1023.98px)')
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );
  protected readonly menuOpen = signal(true);
  protected readonly opened = computed(() => !this.handset() && this.menuOpen());

  protected readonly menu = computed<NavGroup[]>(() =>
    MENU.map((group) => ({
      ...group,
      items: group.items.filter((item) => this.access.can(item.access)),
    })).filter((group) => group.items.length > 0),
  );

  protected readonly initials = computed(() => {
    const user = this.auth.user();
    return user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '';
  });
  protected readonly themeIcon = computed(() => THEME_ICONS[this.theme.mode()]);

  constructor() {
    // Labels and options of every enum, loaded once per session.
    inject(EnumService)
      .load()
      .subscribe({ error: () => undefined });
  }

  protected cycleTheme(): void {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(this.theme.mode()) + 1) % THEME_ORDER.length];
    this.theme.mode.set(next);
  }

  protected logout(): void {
    this.session.logout().subscribe();
  }
}
