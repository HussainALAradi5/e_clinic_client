import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatAvatar } from '@components/communication/chat-avatar/chat-avatar.component';
import { CHAT_LIST_TEXT } from '@constants/communication/chat-list.constants';
import { CHAT_MENU_TEXT } from '@constants/communication/chat-menu.constants';
import { ConversationType } from '@enums/communication/chat.enum';
import { ParticipantRole } from '@enums/communication/participant-role.enum';
import { Conversation } from '@interfaces/communication/conversation.interface';
import { chatStamp } from '@utilities/communication/chat-style';

/** One chat in the list: avatar, name, last activity, the last message, counts, muted and unread badges. */
@Component({
  selector: 'app-chat-list-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChatAvatar, MatIconModule, MatTooltipModule],
  templateUrl: './chat-list-row.component.html',
  styleUrl: './chat-list-row.component.scss',
})
export class ChatListRow {
  readonly chat = input.required<Conversation>();
  readonly active = input(false);
  /** The last message is mine (a read tick before the preview). */
  readonly mine = input(false);
  readonly preview = input('');
  readonly opened = output<void>();
  /** Right-click / long-press: the row menu at the pointer. */
  readonly menu = output<MouseEvent>();

  protected readonly text = CHAT_LIST_TEXT;
  protected readonly menuText = CHAT_MENU_TEXT;
  protected readonly types = ConversationType;
  protected readonly roles = ParticipantRole;
  protected readonly stamp = chatStamp;
}
