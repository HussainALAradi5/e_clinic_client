import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { Observable } from 'rxjs';
import { ConversationType, ParticipantRole } from '@enums/communication/chat.enum';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { ChatContact, ChatMember, Conversation } from '@interfaces/communication/chat.interface';
import { ChatApi } from '@services/communication/chat-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { ChatAvatar } from '../chat-avatar/chat-avatar.component';

/**
 * Who is in the chat, with Leader / Member / You badges. A leader renames the group, adds people, makes someone
 * leader or member and removes members; anyone can leave. Closes with the updated chat, or `null` after leaving.
 */
@Component({
  selector: 'app-group-info-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    EnumLabelPipe,
    ChatAvatar,
  ],
  templateUrl: './group-info-dialog.component.html',
  styleUrl: './group-info-dialog.component.scss',
})
export class GroupInfoDialog {
  private readonly ref = inject(MatDialogRef<GroupInfoDialog, Conversation | null>);
  private readonly api = inject(ChatApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);

  protected readonly chat = signal(inject<Conversation>(MAT_DIALOG_DATA));
  protected readonly roles = ParticipantRole;
  protected readonly isGroup = computed(() => this.chat().type === ConversationType.Group);
  protected readonly amLeader = computed(() => this.chat().myRole === ParticipantRole.Admin);
  protected readonly me = computed(() => this.chat().members.find((m) => m.isMe));
  /** Leaders first, then by name; me pinned on top of my own group. */
  protected readonly members = computed(() =>
    [...this.chat().members].sort(
      (a, b) =>
        Number(b.isMe) - Number(a.isMe) ||
        Number(b.role === ParticipantRole.Admin) - Number(a.role === ParticipantRole.Admin) ||
        a.fullName.localeCompare(b.fullName),
    ),
  );

  protected title = this.chat().title;
  protected readonly adding = signal(false);
  protected readonly contacts = signal<ChatContact[]>([]);

  protected rename(): void {
    const title = this.title.trim();
    if (title && title !== this.chat().title) this.apply(this.api.rename(this.chat().id, title));
  }

  protected openAdd(): void {
    this.adding.set(true);
    this.api.contacts().subscribe((list) => {
      const inChat = new Set(this.chat().members.map((m) => m.userId));
      this.contacts.set(list.filter((c) => !inChat.has(c.id)));
    });
  }

  protected add(contact: ChatContact): void {
    this.contacts.update((list) => list.filter((c) => c.id !== contact.id));
    this.apply(this.api.addMembers(this.chat().id, [contact.id]));
  }

  protected setRole(member: ChatMember, role: ParticipantRole): void {
    this.apply(this.api.setRole(this.chat().id, member.userId, role));
  }

  protected async remove(member: ChatMember): Promise<void> {
    const ok = await this.dialogs.confirm({
      title: `Remove ${member.fullName}?`,
      message: 'They stop receiving this group’s messages.',
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!ok) return;
    this.api.removeMember(this.chat().id, member.userId).subscribe({
      next: () =>
        this.chat.update((c) => ({
          ...c,
          members: c.members.filter((m) => m.userId !== member.userId),
        })),
      error: (e: unknown) => this.notify.error(e),
    });
  }

  protected async leave(): Promise<void> {
    const me = this.me();
    if (!me) return;
    const ok = await this.dialogs.confirm({
      title: 'Leave this group?',
      message: 'You will no longer see its messages unless someone adds you back.',
      confirmLabel: 'Leave',
      danger: true,
    });
    if (!ok) return;
    this.api.removeMember(this.chat().id, me.userId).subscribe({
      next: () => this.ref.close(null),
      error: (e: unknown) => this.notify.error(e),
    });
  }

  protected close(): void {
    this.ref.close(this.chat());
  }

  private apply(request: Observable<Conversation>): void {
    request.subscribe({
      next: (chat) => this.chat.set({ ...this.chat(), ...chat }),
      error: (e: unknown) => this.notify.error(e),
    });
  }
}
