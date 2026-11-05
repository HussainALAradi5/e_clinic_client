import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  CHAT_LIST_SKELETON_ROWS,
  CHAT_LIST_TEXT,
} from '@constants/communication/chat-list.constants';

/** List items shown instead of chats: shimmering rows while loading, or "No chats here". */
@Component({
  selector: 'app-chat-list-states',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  // Its items are the list's own <li>s.
  host: { role: 'presentation' },
  templateUrl: './chat-list-states.component.html',
  styleUrl: './chat-list-states.component.scss',
})
export class ChatListStates {
  readonly loading = input(false);
  readonly empty = input(false);

  protected readonly text = CHAT_LIST_TEXT;
  protected readonly rows = CHAT_LIST_SKELETON_ROWS;
}
