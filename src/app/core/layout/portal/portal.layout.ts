import { initials } from '@shared/utils/text';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NotificationBell } from '../notification-bell/notification-bell.component';
import { BrandMark } from '@shared/components/brand-mark/brand-mark.component';
import { PORTAL_IDLE_MINUTES, PORTAL_PATH } from '@shared/constants/app.constants';
import { PORTAL_MORE, PORTAL_TABS } from '@shared/constants/portal.constants';
import { AuthStore } from '@shared/services/auth/auth.store';
import { SessionService } from '@shared/services/auth/session.service';
import { EnumService } from '@shared/services/data/enum.service';
import { ThemeService } from '@shared/services/ui/theme.service';

/** Activity that keeps a portal session alive. */
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;

/**
 * Patient portal frame, phone first: pine header (inbox, account menu), the page, and a bottom tab bar on phones
 * (header links on wider screens). Signs out after {@link PORTAL_IDLE_MINUTES} minutes without activity.
 */
@Component({
  selector: 'app-portal-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    NotificationBell,
    BrandMark,
  ],
  host: { class: 'flex min-h-dvh flex-col bg-surface-container-low' },
  templateUrl: './portal.layout.html',
  styleUrl: './portal.layout.scss',
})
export class PortalLayout {
  protected readonly auth = inject(AuthStore);
  protected readonly theme = inject(ThemeService);
  private readonly session = inject(SessionService);

  protected readonly tabs = PORTAL_TABS;
  protected readonly more = PORTAL_MORE;
  protected readonly home = PORTAL_PATH;
  protected readonly inbox = `${PORTAL_PATH}/notifications`;
  protected readonly security = `${PORTAL_PATH}/security`;
  protected readonly initials = computed(() => initials(this.auth.user()?.fullName));

  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(EnumService)
      .load()
      .subscribe({ error: () => undefined });
    this.watchIdle();
  }

  protected logout(): void {
    this.session.logout().subscribe();
  }

  /** Shared or family devices: a forgotten session closes itself. */
  private watchIdle(): void {
    const doc = inject(DOCUMENT);
    const reset = (): void => {
      if (this.idleTimer) clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => this.expire(), PORTAL_IDLE_MINUTES * 60_000);
    };
    ACTIVITY_EVENTS.forEach((type) => doc.addEventListener(type, reset, { passive: true }));
    reset();
    inject(DestroyRef).onDestroy(() => {
      ACTIVITY_EVENTS.forEach((type) => doc.removeEventListener(type, reset));
      if (this.idleTimer) clearTimeout(this.idleTimer);
    });
  }

  private expire(): void {
    this.session
      .logout(`You were signed out after ${PORTAL_IDLE_MINUTES} minutes without activity.`)
      .subscribe();
  }
}
