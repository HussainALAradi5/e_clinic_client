import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CHAT_ACTIONS_TEXT } from '@constants/communication/chat-actions.constants';
import { CHAT_MENU_TEXT } from '@constants/communication/chat-menu.constants';
import { ConversationType } from '@enums/communication/chat.enum';
import { MuteDuration } from '@enums/communication/mute-duration.enum';
import { Conversation } from '@interfaces/communication/conversation.interface';
import { AccessService } from '@services/auth/access.service';
import { AuthStore } from '@services/auth/auth.store';
import { ChatApi } from '@services/communication/chat-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';

/**
 * What I can do to a chat from its menus (the list's right-click menu and the open chat's ⋮): mute, exit a group,
 * delete it from my list (a group after exiting), and — admins — delete it for everyone or restore it.
 * Each asks first where it matters, shows the outcome, and returns the result (null when cancelled or refused).
 */
@Injectable({ providedIn: 'root' })
export class ChatActions {
  private readonly api = inject(ChatApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly auth = inject(AuthStore);
  private readonly text = CHAT_ACTIONS_TEXT;
  /** Admins moderate: delete for everyone, see and restore deleted chats. */
  readonly canModerate = inject(AccessService).can('chat.read_all');

  isGroup(chat: Conversation): boolean {
    return chat.type === ConversationType.Group;
  }

  /** Still a member of this group (exit is offered). */
  canLeave(chat: Conversation): boolean {
    return this.isGroup(chat) && !chat.left && !chat.deletedAt;
  }

  /** Delete from my list: a one-to-one chat any time, a group once I left it. */
  canDelete(chat: Conversation): boolean {
    return !chat.deletedAt && (!this.isGroup(chat) || chat.left);
  }

  canMute(chat: Conversation): boolean {
    return !chat.left && !chat.deletedAt;
  }

  async mute(chat: Conversation, duration: MuteDuration | null): Promise<Conversation | null> {
    try {
      const updated = await firstValueFrom(this.api.mute(chat.id, duration));
      this.notify.success(duration ? CHAT_MENU_TEXT.mutedDone : CHAT_MENU_TEXT.unmutedDone);
      return updated;
    } catch (e) {
      this.notify.error(e);
      return null;
    }
  }

  /** Exits the group; returns the chat as I now see it (left, read-only). */
  async leave(chat: Conversation): Promise<Conversation | null> {
    const me = this.auth.user()?.id;
    if (!me) return null;
    const ok = await this.dialogs.confirm({
      title: this.text.leaveTitle(chat.title),
      message: this.text.leaveMessage,
      confirmLabel: this.text.leave,
      danger: true,
    });
    if (!ok) return null;
    return this.run(async () => {
      await firstValueFrom(this.api.removeMember(chat.id, me));
      this.notify.success(this.text.left(chat.title));
      return firstValueFrom(this.api.conversation(chat.id));
    });
  }

  /** Deletes the chat from my list only; true when done. */
  async deleteForMe(chat: Conversation): Promise<boolean> {
    const ok = await this.dialogs.confirm({
      title: this.text.deleteTitle(chat.title),
      message: this.isGroup(chat) ? this.text.deleteGroupMessage : this.text.deleteDirectMessage,
      confirmLabel: this.text.deleteChat,
      danger: true,
    });
    if (!ok) return false;
    return (
      (await this.run(async () => {
        await firstValueFrom(this.api.remove(chat.id));
        this.notify.success(this.text.deleted);
        return true;
      })) ?? false
    );
  }

  /** Admins: deletes the whole chat for every member (restorable); true when done. */
  async deleteForEveryone(chat: Conversation): Promise<boolean> {
    const ok = await this.dialogs.confirm({
      title: this.text.deleteForEveryone,
      message: this.text.deleteForEveryoneMessage,
      confirmLabel: this.text.deleteForEveryone,
      danger: true,
    });
    if (!ok) return false;
    return (
      (await this.run(async () => {
        await firstValueFrom(this.api.removeForEveryone(chat.id));
        return true;
      })) ?? false
    );
  }

  async restore(chat: Conversation): Promise<boolean> {
    return (
      (await this.run(async () => {
        await firstValueFrom(this.api.restore(chat.id));
        this.notify.success(this.text.restored(chat.title));
        return true;
      })) ?? false
    );
  }

  /** Runs one call; a failure shows as an error message and gives null. */
  private async run<T>(call: () => Promise<T>): Promise<T | null> {
    try {
      return await call();
    } catch (e) {
      this.notify.error(e);
      return null;
    }
  }
}
