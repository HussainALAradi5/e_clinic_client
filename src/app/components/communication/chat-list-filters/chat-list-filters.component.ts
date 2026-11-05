import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CHAT_FILTER_CHIPS, CHAT_LIST_TEXT } from '@constants/communication/chat-list.constants';
import { ChatFilter } from '@enums/communication/chat-filter.enum';

/** The chat list's search box, filter chips (All / Unread / Groups / One-to-one / Read, Deleted for admins) and date range. */
@Component({
  selector: 'app-chat-list-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './chat-list-filters.component.html',
  styleUrl: './chat-list-filters.component.scss',
})
export class ChatListFilters {
  readonly search = model('');
  readonly filter = model(ChatFilter.All);
  readonly showDeleted = model(false);
  readonly from = model('');
  readonly to = model('');
  /** Admins see the Deleted chip. */
  readonly canSeeDeleted = input(false);

  protected readonly text = CHAT_LIST_TEXT;
  protected readonly chips = CHAT_FILTER_CHIPS;
  protected readonly dateActive = computed(() => !!this.from() || !!this.to());

  protected clearDates(): void {
    this.from.set('');
    this.to.set('');
  }
}
