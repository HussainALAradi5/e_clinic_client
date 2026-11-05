import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { EMPTY, filter, merge, switchMap } from 'rxjs';
import { MessageKind } from '@enums/communication/message-kind.enum';
import { ChatMessage } from '@interfaces/communication/chat-message.interface';
import { ReadReceipt } from '@interfaces/communication/read-receipt.interface';
import { AuthStore } from '@services/auth/auth.store';
import { ChatApi } from '@services/communication/chat-api.service';
import { ChatSettingsStore } from '@services/communication/chat-settings.store';
import { RealtimeService } from '@services/communication/realtime.service';
import { NotifyService } from '@services/ui/notify.service';
import { poll } from '@utilities/poll';
import { CHAT_LAUNCHER_TEXT } from '@constants/layout/chat-launcher.constants';
import { TapMotionDirective } from '@directives/tap-motion.directive';

const POLL_MS = 60_000;
export const CHAT_PATH = '/chat';

/**
 * Toolbar chat button: unread messages over all my chats (live, polled as a fallback). The chat settings decide
 * whether the number shows (otherwise a dot) and whether a new message pops up while the chat page is closed.
 */
@Component({
  selector: 'app-chat-launcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
    TapMotionDirective,
  ],
  templateUrl: './chat-launcher.component.html',
})
export class ChatLauncher {
  protected readonly text = CHAT_LAUNCHER_TEXT;

  /** I muted the chat and was not mentioned: stay quiet. */
  private mutedForMe(message: ChatMessage): boolean {
    const me = this.auth.user()?.id ?? '';
    return (message.mutedFor ?? []).includes(me) && !message.mentions.includes(me);
  }

  private readonly api = inject(ChatApi);
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);
  private readonly auth = inject(AuthStore);
  private readonly realtime = inject(RealtimeService);
  private readonly store = inject(ChatSettingsStore);

  protected readonly path = CHAT_PATH;
  protected readonly settings = this.store.settings;
  protected readonly unread = signal(0);
  protected readonly badge = computed(() => {
    if (!this.settings().countInBadge) return '';
    return this.unread() > 99 ? '99+' : String(this.unread());
  });

  constructor() {
    this.store.load();
    const refresh = () =>
      this.api.unread().subscribe({ next: (n) => this.unread.set(n), error: () => undefined });

    poll(() => this.api.unread(), { interval: POLL_MS, maxInterval: POLL_MS })
      .pipe(takeUntilDestroyed())
      .subscribe({ next: (n) => this.unread.set(n), error: () => undefined });

    // Reading a chat on the chat page lowers the count.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(refresh);

    toObservable(this.auth.user)
      .pipe(
        switchMap((user) =>
          user
            ? merge(
                this.realtime.listen<ChatMessage>(`user.${user.id}`, 'message.sent'),
                this.realtime.listen<ReadReceipt>(`user.${user.id}`, 'conversation.read'),
              )
            : EMPTY,
        ),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        refresh();
        const onChat = this.router.url.startsWith(CHAT_PATH);
        if (
          'sender' in event &&
          !onChat &&
          event.sender.id !== this.auth.user()?.id &&
          this.settings().notifyMessages &&
          !this.mutedForMe(event)
        ) {
          const text =
            event.body ?? (event.kind === MessageKind.Voice ? '🎤 Voice note' : '📎 File');
          this.notify.info(`${event.sender.fullName}: ${text}`, CHAT_LAUNCHER_TEXT.open).subscribe(
            () =>
              void this.router.navigate([CHAT_PATH], {
                queryParams: { c: event.conversationId },
              }),
          );
        }
      });
  }
}
