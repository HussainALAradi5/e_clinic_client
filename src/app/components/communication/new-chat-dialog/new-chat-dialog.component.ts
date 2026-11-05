import { CONTACT_SEARCH } from '@constants/communication/contact-search.constants';
import { ContactSearchStore } from '@services/communication/contact-search.store';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { ConversationType } from '@enums/communication/chat.enum';
import { ChatContact } from '@interfaces/communication/chat.interface';
import { Conversation } from '@interfaces/communication/conversation.interface';
import { ChatApi } from '@services/communication/chat-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { ChatAvatar } from '../chat-avatar/chat-avatar.component';
import { NEW_CHAT_DIALOG_TEXT } from '@constants/communication/new-chat-dialog.constants';

/** Start a one-to-one chat with a colleague, or a group (you become its leader). Closes with the chat. */
@Component({
  selector: 'app-new-chat-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    EnumLabelPipe,
    ChatAvatar,
  ],
  providers: [ContactSearchStore],
  templateUrl: './new-chat-dialog.component.html',
})
export class NewChatDialog implements OnInit {
  private readonly ref = inject(MatDialogRef<NewChatDialog, Conversation>);
  private readonly api = inject(ChatApi);
  private readonly notify = inject(NotifyService);

  protected readonly text = NEW_CHAT_DIALOG_TEXT;
  protected readonly types = ConversationType;
  protected type = ConversationType.Direct;
  protected title = '';
  protected readonly contacts = inject(ContactSearchStore);
  protected readonly searchText = CONTACT_SEARCH;
  protected readonly picked = signal(new Set<string>());
  protected readonly busy = signal(false);
  ngOnInit(): void {
    void this.contacts.start();
  }

  protected toggle(id: string): void {
    this.picked.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected direct(contact: ChatContact): void {
    this.run(this.api.start({ type: ConversationType.Direct, userId: contact.id }));
  }

  protected group(): void {
    this.run(
      this.api.start({
        type: ConversationType.Group,
        title: this.title.trim(),
        memberIds: [...this.picked()],
      }),
    );
  }

  private run(request: ReturnType<ChatApi['start']>): void {
    this.busy.set(true);
    request.subscribe({
      next: (chat) => this.ref.close(chat),
      error: (e: unknown) => {
        this.busy.set(false);
        this.notify.error(e);
      },
    });
  }
}
