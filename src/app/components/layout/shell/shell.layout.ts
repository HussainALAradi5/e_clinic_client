import { initials } from '@utilities/text';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { ChatLauncher } from '../chat-launcher/chat-launcher.component';
import { NotificationBell } from '../notification-bell/notification-bell.component';
import { BrandMark } from '@components/common/brand-mark/brand-mark.component';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { ACCOUNT_SECURITY_PATH } from '@constants/app.constants';
import { AuthStore } from '@services/auth/auth.store';
import { SessionService } from '@services/auth/session.service';
import { EnumService } from '@services/data/enum.service';
import { AccessService } from '@services/auth/access.service';
import { NavigationService } from '@services/ui/navigation.service';
import { ThemeService } from '@services/ui/theme.service';
import { NotificationSoundService } from '@services/notification/notification-sound.service';
import { PushNotificationService } from '@services/notification/push-notification.service';

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
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    NotificationBell,
    ChatLauncher,
    BrandMark,
    EnumLabelPipe,
  ],
  templateUrl: './shell.layout.html',
  styleUrl: './shell.layout.scss',
})
export class ShellLayout {
  protected readonly auth = inject(AuthStore);
  protected readonly theme = inject(ThemeService);
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

  protected readonly menu = inject(NavigationService).menu;
  private readonly access = inject(AccessService);
  protected readonly canChat = computed(() => this.access.can('chat.read_own | chat.read_all'));

  protected readonly initials = computed(() => initials(this.auth.user()?.fullName));

  constructor() {
    // Labels and options of every enum, loaded once per session.
    inject(EnumService)
      .load()
      .subscribe({ error: () => undefined });
    // A browser that allowed notifications keeps getting them after each sign-in.
    void inject(PushNotificationService).sync();
    inject(NotificationSoundService).listen();
  }

  protected logout(): void {
    this.session.logout().subscribe();
  }
}
