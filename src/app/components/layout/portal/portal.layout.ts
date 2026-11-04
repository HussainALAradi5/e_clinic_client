import { initials } from '@utilities/text';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TapMotionDirective } from '@directives/tap-motion.directive';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NotificationBell } from '../notification-bell/notification-bell.component';
import { BrandMark } from '@components/common/brand-mark/brand-mark.component';
import { PORTAL_IDLE_MINUTES, PORTAL_PATH } from '@constants/app.constants';
import { PORTAL_MORE, PORTAL_TABS } from '@constants/portal.constants';
import { AuthStore } from '@services/auth/auth.store';
import { SessionService } from '@services/auth/session.service';
import { EnumService } from '@services/data/enum.service';
import { ThemeService } from '@services/ui/theme.service';
import { PORTAL_TEXT } from '@constants/layout/portal.constants';
import { NotificationSoundService } from '@services/notification/notification-sound.service';
import { PushNotificationService } from '@services/notification/push-notification.service';

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
    TapMotionDirective,
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
    // A browser that allowed notifications keeps getting them after each sign-in.
    void inject(PushNotificationService).sync();
    inject(NotificationSoundService).listen();
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
    this.session.logout(PORTAL_TEXT.youWereSignedOutAfter(PORTAL_IDLE_MINUTES)).subscribe();
  }
}
