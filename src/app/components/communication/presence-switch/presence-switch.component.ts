import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { PRESENCE_TEXT } from '@constants/communication/chat-actions.constants';
import { PresenceStatus } from '@enums/identity/presence-status.enum';
import { AuthStore } from '@services/auth/auth.store';
import { AuthApi } from '@services/identity/auth-api.service';
import { NotifyService } from '@services/ui/notify.service';

/**
 * My Online / Offline status in chat, as a pill that switches it. Signing in sets Online and signing out
 * (everywhere) Offline on the server; this lets me change it in between.
 */
@Component({
  selector: 'app-presence-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTooltipModule],
  templateUrl: './presence-switch.component.html',
  styleUrl: './presence-switch.component.scss',
})
export class PresenceSwitch {
  private readonly auth = inject(AuthStore);
  private readonly api = inject(AuthApi);
  private readonly notify = inject(NotifyService);

  protected readonly text = PRESENCE_TEXT;
  protected readonly busy = signal(false);
  protected readonly online = computed(() => this.auth.user()?.presence === PresenceStatus.Online);

  protected async toggle(): Promise<void> {
    const user = this.auth.user();
    if (!user || this.busy()) return;
    this.busy.set(true);
    try {
      const next = this.online() ? PresenceStatus.Offline : PresenceStatus.Online;
      const { presence } = await firstValueFrom(this.api.setPresence(next));
      this.auth.setUser({ ...user, presence });
    } catch (e) {
      this.notify.error(e);
    } finally {
      this.busy.set(false);
    }
  }
}
