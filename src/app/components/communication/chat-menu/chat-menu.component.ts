import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DATE_TIME_FORMAT } from '@constants/app.constants';
import { CHAT_MENU_TEXT, MUTE_CHOICES } from '@constants/communication/chat-menu.constants';
import { TapMotionDirective } from '@directives/tap-motion.directive';
import { ConversationType } from '@enums/communication/chat.enum';
import { MuteDuration } from '@enums/communication/mute-duration.enum';
import { Conversation } from '@interfaces/communication/conversation.interface';
import { ChatApi } from '@services/communication/chat-api.service';
import { NotifyService } from '@services/ui/notify.service';

/**
 * The ⋮ menu of an open chat (one-to-one or group): chat info, and mute for 8 hours / 1 week / until unmuted —
 * only for me; mentions still reach me. Emits the updated chat after a mute change.
 */
@Component({
  selector: 'app-chat-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    TapMotionDirective,
    DatePipe,
  ],
  template: `
    <button
      matIconButton
      tapMotion
      [matMenuTriggerFor]="menu"
      [matTooltip]="text.more"
      [attr.aria-label]="text.more"
    >
      <mat-icon>more_vert</mat-icon>
    </button>
    <mat-menu #menu="matMenu" xPosition="before">
      <button mat-menu-item (click)="info.emit()">
        <mat-icon>info</mat-icon>{{ isGroup() ? text.groupInfo : text.info }}
      </button>
      @if (chat().muted) {
        <button mat-menu-item (click)="mute(null)">
          <mat-icon>notifications_active</mat-icon>
          <span>
            {{ text.unmute }}
            @if (chat().mutedUntil; as until) {
              <span class="block text-xs text-on-surface-variant">{{
                text.mutedUntil((until | date: dateFormat) ?? '')
              }}</span>
            }
          </span>
        </button>
      } @else {
        <button mat-menu-item [matMenuTriggerFor]="durations">
          <mat-icon>notifications_off</mat-icon>{{ text.mute }}
        </button>
      }
    </mat-menu>
    <mat-menu #durations="matMenu">
      @for (choice of choices; track choice.value) {
        <button mat-menu-item (click)="mute(choice.value)">{{ choice.label }}</button>
      }
    </mat-menu>
  `,
})
export class ChatMenu {
  readonly chat = input.required<Conversation>();
  readonly info = output<void>();
  readonly changed = output<Conversation>();

  private readonly api = inject(ChatApi);
  private readonly notify = inject(NotifyService);
  protected readonly text = CHAT_MENU_TEXT;
  protected readonly choices = MUTE_CHOICES;
  protected readonly dateFormat = DATE_TIME_FORMAT;
  protected readonly isGroup = computed(() => this.chat().type === ConversationType.Group);

  protected mute(duration: MuteDuration | null): void {
    this.api.mute(this.chat().id, duration).subscribe({
      next: (updated) => {
        this.changed.emit(updated);
        this.notify.success(duration ? this.text.mutedDone : this.text.unmutedDone);
      },
      error: (e: unknown) => this.notify.error(e),
    });
  }
}
