import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, EMPTY, interval, merge, Subject, switchMap } from 'rxjs';
import {
  ChatFilter,
  ConversationType,
  MessageKind,
  ParticipantRole,
} from '@shared/enums/communication/chat.enum';
import {
  ChatMessage,
  Conversation,
  ConversationQuery,
  ReadReceipt,
  SendMessagePayload,
} from '@shared/interfaces/communication/chat.interface';
import { AuthStore } from '@shared/services/auth/auth.store';
import { ChatApi } from '@shared/services/communication/chat-api.service';
import { ChatSettingsStore } from '@shared/services/communication/chat-settings.store';
import { RealtimeService } from '@shared/services/communication/realtime.service';
import { EnumService } from '@shared/services/data/enum.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { AccessService } from '@shared/services/auth/access.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { ChatAvatar } from '../../components/chat-avatar/chat-avatar.component';
import { ChatSettingsDialog } from '../../components/chat-settings-dialog/chat-settings-dialog.component';
import { GroupInfoDialog } from '../../components/group-info-dialog/group-info-dialog.component';
import { MessageBubble } from '../../components/message-bubble/message-bubble.component';
import { MessageComposer } from '../../components/message-composer/message-composer.component';
import { NewChatDialog } from '../../components/new-chat-dialog/new-chat-dialog.component';
import { chatStamp, dayLabel } from '../../utils/chat-style';

const PAGE_SIZE = 20;
/** Messages closer than this from the same sender share one avatar / name. */
const RUN_GAP_MS = 5 * 60_000;
/** Without a live socket the page refreshes on these intervals. */
const POLL_LIST_MS = 30_000;
const POLL_CHAT_MS = 8_000;

interface MessageRow {
  message: ChatMessage;
  day: string | null;
  first: boolean;
}

/**
 * Staff chat, WhatsApp-style: the chat list (search, All / Groups / One-to-one / Unread / Read chips and a date
 * range, all filtered and paged by the server) beside the open chat. Live over the socket; polls without one.
 * Every request names the open chat, and socket events are matched on their chat id, so chats never mix.
 */
@Component({
  selector: 'app-chat-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    ChatAvatar,
    MessageBubble,
    MessageComposer,
  ],
  templateUrl: './chat.page.html',
  styleUrl: './chat.page.scss',
})
export class ChatPage implements OnInit {
  private readonly api = inject(ChatApi);
  private readonly realtime = inject(RealtimeService);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly settingsStore = inject(ChatSettingsStore);
  private readonly enums = inject(EnumService);

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private readonly rowMenu = viewChild<MatMenuTrigger>('rowMenuTrigger');
  private readonly rowAnchor = viewChild<ElementRef<HTMLElement>>('rowAnchor');
  /** Admins (chat.read_all) may switch the list to deleted chats, read them and restore them. */
  protected readonly canSeeDeleted = inject(AccessService).can('chat.read_all');
  protected readonly showDeleted = signal(false);
  /** The chat a right-click opened the menu for, and where. */
  protected readonly menuChat = signal<Conversation | null>(null);
  protected readonly menuAt = signal({ x: 0, y: 0 });
  private readonly composer = viewChild(MessageComposer);

  private readonly auth = inject(AuthStore);
  protected readonly me = computed(() => this.auth.user()?.id ?? '');
  protected readonly settings = this.settingsStore.settings;
  protected readonly live = this.realtime.connected;
  protected readonly filters = ChatFilter;
  protected readonly roles = ParticipantRole;
  protected readonly types = ConversationType;
  protected readonly chips = [
    { value: ChatFilter.All, label: 'All', icon: 'forum' },
    { value: ChatFilter.Unread, label: 'Unread', icon: 'mark_chat_unread' },
    { value: ChatFilter.Groups, label: 'Groups', icon: 'groups' },
    { value: ChatFilter.Direct, label: 'One-to-one', icon: 'person' },
    { value: ChatFilter.Read, label: 'Read', icon: 'done_all' },
  ];

  // Chat list (server-side search, filters and paging)
  protected readonly filter = signal(ChatFilter.All);
  protected readonly search = signal('');
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly chats = signal<Conversation[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly lastPage = signal(1);
  protected readonly listLoading = signal(true);
  private readonly reload$ = new Subject<void>();

  // Open chat
  protected readonly selectedId = signal<string | null>(null);
  protected readonly chat = signal<Conversation | null>(null);
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly hasMore = signal(false);
  protected readonly loadingMessages = signal(false);
  protected readonly sending = signal(false);
  /** The message being answered in the composer. */
  protected readonly replyTo = signal<ChatMessage | null>(null);
  protected readonly dragging = signal(false);

  protected readonly dateActive = computed(() => !!this.from() || !!this.to());
  protected readonly isGroup = computed(() => this.chat()?.type === ConversationType.Group);
  protected readonly leaderCount = computed(
    () => this.chat()?.members.filter((m) => m.role === ParticipantRole.Admin).length ?? 0,
  );
  protected readonly subtitle = computed(() => {
    const chat = this.chat();
    if (!chat) return '';
    if (chat.type === ConversationType.Direct) {
      const partner = chat.members.find((m) => !m.isMe);
      return partner ? this.enums.label('UserType', partner.userType) : '';
    }
    return chat.members.map((m) => (m.isMe ? 'You' : m.fullName.split(' ')[0])).join(', ');
  });

  protected readonly rows = computed<MessageRow[]>(() => {
    const list = this.messages();
    return list.map((message, i) => {
      const prev = list[i - 1];
      const day =
        !prev || dayLabel(prev.createdAt) !== dayLabel(message.createdAt)
          ? dayLabel(message.createdAt)
          : null;
      const gap = prev
        ? new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime()
        : Infinity;
      return {
        message,
        day,
        first: !!day || !prev || prev.sender.id !== message.sender.id || gap > RUN_GAP_MS,
      };
    });
  });

  protected stamp = chatStamp;

  constructor() {
    this.settingsStore.load();

    // The list reloads (debounced) whenever a filter changes.
    effect(() => {
      this.filter();
      this.search();
      this.from();
      this.to();
      this.showDeleted();
      untracked(() => this.reload$.next());
    });
    this.reload$.pipe(debounceTime(250), takeUntilDestroyed()).subscribe(() => this.loadChats(1));

    // Everything addressed to me: new messages anywhere, chat changes, my reads on other devices.
    toObservable(this.me)
      .pipe(
        switchMap((id) =>
          id
            ? merge(
                this.realtime.listen<ChatMessage>(`user.${id}`, 'message.sent'),
                this.realtime.listen<{ conversationId: string }>(
                  `user.${id}`,
                  'conversation.changed',
                ),
                this.realtime.listen<ReadReceipt>(`user.${id}`, 'conversation.read'),
              )
            : EMPTY,
        ),
        takeUntilDestroyed(),
      )
      .subscribe((event) => this.onUserEvent(event));

    // The open chat: its messages, reactions and read receipts (matched on the chat id).
    toObservable(this.selectedId)
      .pipe(
        switchMap((id) =>
          id
            ? merge(
                this.realtime.listen<ChatMessage>(`conversation.${id}`, 'message.reacted'),
                this.realtime.listen<ReadReceipt>(`conversation.${id}`, 'conversation.read'),
              )
            : EMPTY,
        ),
        takeUntilDestroyed(),
      )
      .subscribe((event) => this.onChatEvent(event));

    // No socket: refresh the list and the open chat on a timer.
    toObservable(this.live)
      .pipe(
        switchMap((connected) =>
          connected ? EMPTY : merge(interval(POLL_LIST_MS), interval(POLL_CHAT_MS)),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((tick) => this.poll(tick));
  }

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('c');
      if (id !== this.selectedId()) this.open(id);
    });
  }

  // ---- list -------------------------------------------------------------------------------------------------

  protected loadChats(page: number, quiet = false): void {
    if (!quiet) this.listLoading.set(true);
    this.api.conversations(this.query(page), true).subscribe({
      next: (result) => {
        this.chats.set(page === 1 ? result.data : [...this.chats(), ...result.data]);
        this.page.set(result.meta.currentPage ?? page);
        this.lastPage.set(result.meta.lastPage ?? 1);
        this.total.set(result.meta.total ?? result.data.length);
        this.listLoading.set(false);
      },
      error: (e: unknown) => {
        this.listLoading.set(false);
        this.notify.error(e);
      },
    });
  }

  protected more(): void {
    this.loadChats(this.page() + 1);
  }

  protected clearDates(): void {
    this.from.set('');
    this.to.set('');
  }

  private query(page: number): ConversationQuery {
    const f = this.filter();
    return {
      page,
      perPage: PAGE_SIZE,
      search: this.search().trim() || undefined,
      type:
        f === ChatFilter.Groups
          ? ConversationType.Group
          : f === ChatFilter.Direct
            ? ConversationType.Direct
            : undefined,
      read: f === ChatFilter.Unread ? 'unread' : f === ChatFilter.Read ? 'read' : undefined,
      from: this.from() || undefined,
      to: this.to() || undefined,
      deleted: this.showDeleted() ? 1 : undefined,
    };
  }

  // ---- open chat --------------------------------------------------------------------------------------------

  protected select(chat: Conversation): void {
    void this.router.navigate([], {
      queryParams: { c: chat.id },
      replaceUrl: this.selectedId() !== null,
    });
  }

  protected back(): void {
    void this.router.navigate([], { queryParams: {} });
  }

  private open(id: string | null): void {
    this.selectedId.set(id);
    this.replyTo.set(null);
    this.messages.set([]);
    this.hasMore.set(false);
    this.chat.set(id ? (this.chats().find((c) => c.id === id) ?? null) : null);
    if (!id) return;

    this.loadingMessages.set(true);
    this.api.conversation(id).subscribe({
      next: (chat) => {
        if (this.selectedId() !== id) return;
        // Opened from a link before the list loaded: the messages render only now.
        const first = this.chat() === null;
        this.chat.set(chat);
        if (first) this.scrollToEnd();
      },
      error: (e: unknown) => {
        this.notify.error(e);
        this.back();
      },
    });
    this.api.messages(id).subscribe({
      next: ({ data, hasMore }) => {
        if (this.selectedId() !== id) return;
        this.messages.set([...data].reverse());
        this.hasMore.set(hasMore);
        this.loadingMessages.set(false);
        this.scrollToEnd();
        this.markRead(id);
      },
      error: () => this.loadingMessages.set(false),
    });
  }

  protected older(): void {
    const id = this.selectedId();
    const oldest = this.messages()[0];
    if (!id || !oldest || this.loadingMessages()) return;
    const el = this.scroller()?.nativeElement;
    const fromBottom = el ? el.scrollHeight - el.scrollTop : 0;
    this.loadingMessages.set(true);
    this.api.messages(id, oldest.id).subscribe({
      next: ({ data, hasMore }) => {
        if (this.selectedId() !== id) return;
        this.messages.update((list) => [...[...data].reverse(), ...list]);
        this.hasMore.set(hasMore);
        this.loadingMessages.set(false);
        // Keep the reader where they were.
        requestAnimationFrame(() => el && (el.scrollTop = el.scrollHeight - fromBottom));
      },
      error: () => this.loadingMessages.set(false),
    });
  }

  protected scrolled(el: HTMLElement): void {
    if (el.scrollTop < 60 && this.hasMore()) this.older();
  }

  protected send(payload: SendMessagePayload): void {
    const id = this.selectedId();
    if (!id) return;
    this.sending.set(true);
    const replyToId = this.replyTo()?.id;
    this.api.send(id, { ...payload, replyToId }).subscribe({
      next: (message) => {
        this.sending.set(false);
        this.replyTo.set(null);
        this.upsert(message);
        this.bump(message, false);
        this.scrollToEnd();
      },
      error: (e: unknown) => {
        this.sending.set(false);
        this.notify.error(e);
      },
    });
  }

  /** A quote was clicked: scroll its original into view and flash it (when it is loaded). */
  protected jumpTo(messageId: string): void {
    const el = document.getElementById(`msg-${messageId}`);
    if (!el) {
      this.notify.info('That message is further back — scroll up to load it.');
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }

  protected react(message: ChatMessage, emoji: string): void {
    this.api.react(message.conversationId, message.id, emoji).subscribe({
      next: (updated) => this.upsert(updated),
      error: (e: unknown) => this.notify.error(e),
    });
  }

  // ---- dialogs ----------------------------------------------------------------------------------------------

  protected async newChat(): Promise<void> {
    const chat = await this.dialogs.open<NewChatDialog, null, Conversation>(NewChatDialog, null, {
      width: '460px',
    });
    if (!chat) return;
    this.chats.update((list) => [chat, ...list.filter((c) => c.id !== chat.id)]);
    this.select(chat);
  }

  // ---- right-click menu on a chat ---------------------------------------------------------------------------

  /** Right-click (long-press on touch) a chat: its menu opens where the pointer is. */
  protected openRowMenu(event: MouseEvent, chat: Conversation): void {
    event.preventDefault();
    this.menuChat.set(chat);
    // The anchor is placed inside its panel (the glass panel is the containing block, not the window).
    const panel = this.rowAnchor()?.nativeElement.offsetParent?.getBoundingClientRect();
    this.menuAt.set({
      x: event.clientX - (panel?.left ?? 0),
      y: event.clientY - (panel?.top ?? 0),
    });
    this.rowMenu()?.openMenu();
  }

  /** Either person deletes a one-to-one chat; a group only its leader. */
  protected canDelete(chat: Conversation): boolean {
    return (
      !chat.deletedAt &&
      (chat.type === ConversationType.Direct || chat.myRole === ParticipantRole.Admin)
    );
  }

  protected readRow(chat: Conversation): void {
    this.markRead(chat.id);
  }

  protected async deleteChat(chat: Conversation): Promise<void> {
    const ok = await this.dialogs.confirm({
      title: `Delete "${chat.title}"?`,
      message:
        chat.type === ConversationType.Group
          ? 'The group disappears for every member. Nothing is erased — an admin can restore it.'
          : 'The chat disappears for both of you. Nothing is erased — an admin can restore it.',
      confirmLabel: 'Delete chat',
      danger: true,
    });
    if (!ok) return;
    this.api.remove(chat.id).subscribe({
      next: () => {
        this.chats.update((list) => list.filter((c) => c.id !== chat.id));
        this.total.update((n) => Math.max(0, n - 1));
        if (this.selectedId() === chat.id) this.back();
        this.notify.success('Chat deleted.');
      },
      error: (e: unknown) => this.notify.error(e),
    });
  }

  protected restoreChat(chat: Conversation): void {
    this.api.restore(chat.id).subscribe({
      next: () => {
        this.chats.update((list) => list.filter((c) => c.id !== chat.id));
        this.total.update((n) => Math.max(0, n - 1));
        if (this.selectedId() === chat.id) this.back();
        this.notify.success(`"${chat.title}" is back for its members.`);
      },
      error: (e: unknown) => this.notify.error(e),
    });
  }

  protected async info(): Promise<void> {
    const chat = this.chat();
    if (!chat) return;
    const result = await this.dialogs.open<GroupInfoDialog, Conversation, Conversation | null>(
      GroupInfoDialog,
      chat,
      { width: '440px', autoFocus: false },
    );
    if (result === null) {
      this.chats.update((list) => list.filter((c) => c.id !== chat.id));
      this.back();
    } else if (result) {
      this.chat.set(result);
      this.chats.update((list) => list.map((c) => (c.id === result.id ? { ...c, ...result } : c)));
    }
  }

  protected openSettings(): void {
    void this.dialogs.open(ChatSettingsDialog, null, { width: '460px', autoFocus: false });
  }

  // ---- drag & drop ------------------------------------------------------------------------------------------

  protected dragOver(event: DragEvent): void {
    if (!this.selectedId() || !event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    this.dragging.set(true);
  }

  protected dragLeave(event: DragEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node))
      this.dragging.set(false);
  }

  protected drop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (event.dataTransfer?.files.length) this.composer()?.addFiles(event.dataTransfer.files);
  }

  protected rejected(message: string): void {
    this.notify.warning(message);
  }

  // ---- list rows ---------------------------------------------------------------------------------------------

  protected preview(chat: Conversation): string {
    const m = chat.lastMessage;
    if (!m) return chat.type === ConversationType.Group ? 'Group created' : 'Say hello 👋';
    const who =
      m.sender.id === this.me()
        ? 'You: '
        : chat.type === ConversationType.Group
          ? `${m.sender.fullName.split(' ')[0]}: `
          : '';
    const text =
      m.kind === MessageKind.Voice
        ? '🎤 Voice note'
        : m.kind === MessageKind.Media && !m.body
          ? `📎 ${m.attachments.length > 1 ? `${m.attachments.length} files` : 'File'}`
          : (m.body ?? '');
    return who + text;
  }

  protected lastMine(chat: Conversation): boolean {
    return chat.lastMessage?.sender.id === this.me();
  }

  // ---- live events ------------------------------------------------------------------------------------------

  private onUserEvent(event: ChatMessage | { conversationId: string } | ReadReceipt): void {
    if ('sender' in event) {
      const open = event.conversationId === this.selectedId();
      if (open) {
        this.upsert(event);
        this.scrollToEnd(true);
        if (event.sender.id !== this.me()) this.markRead(event.conversationId);
      } else if (event.sender.id !== this.me() && this.settings().notifyMessages) {
        this.notify.info(
          `${event.sender.fullName}: ${event.body ?? (event.kind === MessageKind.Voice ? 'Voice note' : 'File')}`,
        );
      }
      this.bump(event, !open && event.sender.id !== this.me());
    } else if ('readAt' in event) {
      if (event.userId === this.me()) this.setUnread(event.conversationId, 0);
    } else {
      this.loadChats(1, true);
      if (event.conversationId === this.selectedId()) {
        this.api.conversation(event.conversationId).subscribe({
          next: (chat) => this.chat.set(chat),
          error: () => this.back(), // removed from the group
        });
      }
    }
  }

  private onChatEvent(event: ChatMessage | ReadReceipt): void {
    if ('sender' in event) {
      if (event.conversationId === this.selectedId()) this.upsert(event);
    } else if (event.conversationId === this.selectedId()) {
      this.chat.update(
        (chat) =>
          chat && {
            ...chat,
            members: chat.members.map((m) =>
              m.userId === event.userId ? { ...m, lastReadAt: event.readAt } : m,
            ),
          },
      );
    }
  }

  private poll(tick: number): void {
    // Two merged intervals: list every 30 s, open chat every 8 s.
    const id = this.selectedId();
    if (tick % Math.round(POLL_LIST_MS / POLL_CHAT_MS) === 0) this.loadChats(1, true);
    if (!id) return;
    this.api.messages(id).subscribe(({ data }) => {
      if (this.selectedId() !== id) return;
      const known = new Set(this.messages().map((m) => m.id));
      const fresh = data.filter((m) => !known.has(m.id));
      data.forEach((m) => known.has(m.id) && this.upsert(m));
      if (fresh.length) {
        this.messages.update((list) => [...list, ...[...fresh].reverse()]);
        this.scrollToEnd(true);
        this.markRead(id);
      }
    });
    this.api.conversation(id).subscribe((chat) => this.selectedId() === id && this.chat.set(chat));
  }

  /** Adds a message to the open chat, or replaces it (reactions changed). */
  private upsert(message: ChatMessage): void {
    if (message.conversationId !== this.selectedId()) return;
    this.messages.update((list) => {
      const at = list.findIndex((m) => m.id === message.id);
      return at === -1 ? [...list, message] : list.map((m, i) => (i === at ? message : m));
    });
  }

  /** Moves a chat to the top with its new last message (and one more unread when it isn't open). */
  private bump(message: ChatMessage, unread: boolean): void {
    const current = this.chats().find((c) => c.id === message.conversationId);
    if (!current) {
      this.loadChats(1, true);
      return;
    }
    const updated: Conversation = {
      ...current,
      lastMessage: message,
      lastMessageAt: message.createdAt,
      unreadCount: current.unreadCount + (unread ? 1 : 0),
      messagesCount: (current.messagesCount ?? 0) + 1,
    };
    this.chats.update((list) => [updated, ...list.filter((c) => c.id !== updated.id)]);
  }

  private markRead(id: string): void {
    // A deleted chat (an admin reading it) is read-only.
    if (this.chat()?.id === id && this.chat()?.deletedAt) return;
    this.setUnread(id, 0);
    this.api.markRead(id).subscribe({ error: () => undefined });
  }

  private setUnread(id: string, count: number): void {
    this.chats.update((list) => list.map((c) => (c.id === id ? { ...c, unreadCount: count } : c)));
  }

  protected scrollToEnd(onlyIfNear = false): void {
    requestAnimationFrame(() => {
      const el = this.scroller()?.nativeElement;
      if (!el) return;
      if (onlyIfNear && el.scrollHeight - el.scrollTop - el.clientHeight > 240) return;
      el.scrollTop = el.scrollHeight;
    });
  }
}
