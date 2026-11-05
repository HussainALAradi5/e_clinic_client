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
import { CHAT_ACTIONS_TEXT } from '@constants/communication/chat-actions.constants';
import { ChatActions } from '@services/communication/chat-actions.service';

/**
 * The ⋮ menu of an open chat (one-to-one or group): chat info; mute for 8 hours / 1 week / until unmuted (only
 * for me; mentions still reach me); exit a group; delete the chat from my list (a group once I left it).
 * Emits the updated chat after a mute or exit, `removed` after a delete.
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
  templateUrl: './chat-menu.component.html',
})
export class ChatMenu {
  readonly chat = input.required<Conversation>();
  readonly info = output<void>();
  readonly changed = output<Conversation>();
  /** Deleted from my list. */
  readonly removed = output<void>();

  protected readonly actions = inject(ChatActions);
  protected readonly text = CHAT_MENU_TEXT;
  protected readonly actionText = CHAT_ACTIONS_TEXT;
  protected readonly choices = MUTE_CHOICES;
  protected readonly dateFormat = DATE_TIME_FORMAT;
  protected readonly isGroup = computed(() => this.chat().type === ConversationType.Group);

  protected async mute(duration: MuteDuration | null): Promise<void> {
    const updated = await this.actions.mute(this.chat(), duration);
    if (updated) this.changed.emit(updated);
  }

  protected async leave(): Promise<void> {
    const updated = await this.actions.leave(this.chat());
    if (updated) this.changed.emit(updated);
  }

  protected async remove(): Promise<void> {
    if (await this.actions.deleteForMe(this.chat())) this.removed.emit();
  }
}
