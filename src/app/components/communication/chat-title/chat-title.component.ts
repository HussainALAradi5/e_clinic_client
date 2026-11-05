import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChatAvatar } from '@components/communication/chat-avatar/chat-avatar.component';
import { CHAT_MENU_TEXT } from '@constants/communication/chat-menu.constants';
import { CHAT_TITLE_TEXT } from '@constants/communication/chat-title.constants';
import { ConversationType } from '@enums/communication/chat.enum';
import { ParticipantRole } from '@enums/communication/participant-role.enum';
import { Conversation } from '@interfaces/communication/conversation.interface';

/** The open chat's name in its header: avatar, name, my role in a group, muted, members and who is active. */
@Component({
  selector: 'app-chat-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChatAvatar, MatIconModule],
  templateUrl: './chat-title.component.html',
  styleUrl: './chat-title.component.scss',
})
export class ChatTitle {
  readonly chat = input.required<Conversation>();
  /** "Active now", "last seen …" or the members' first names. */
  readonly subtitle = input('');
  /** Tapped: open the chat or group info. */
  readonly opened = output<void>();

  protected readonly text = CHAT_TITLE_TEXT;
  protected readonly menuText = CHAT_MENU_TEXT;
  protected readonly roles = ParticipantRole;
  protected readonly isGroup = computed(() => this.chat().type === ConversationType.Group);
}
