import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BubbleStyle } from '@enums/communication/bubble-style.enum';
import { MessageKind } from '@enums/communication/message-kind.enum';
import { ParticipantRole } from '@enums/communication/participant-role.enum';
import { ChatAttachment } from '@interfaces/communication/chat-attachment.interface';
import { ChatMember } from '@interfaces/communication/chat-member.interface';
import { ChatMessage } from '@interfaces/communication/chat-message.interface';
import { ChatSettings } from '@interfaces/communication/chat-settings.interface';
import { clinicTime } from '@utilities/clinic-time';
import { ChatAvatar } from '../chat-avatar/chat-avatar.component';
import {
  BUBBLE_COLORS,
  fileSize,
  LEADER_BUBBLE,
  tintFor,
} from '@utilities/communication/chat-style';
import { Segment } from '@interfaces/communication/message-bubble.interface';

const LONG_PRESS_MS = 450;
/** Space the bar with its "+" grid needs above a bubble; less and it opens below. */
const PICKER_ROOM_PX = 300;
/** A touch swipe this far right replies (as on WhatsApp). */
const SWIPE_REPLY_PX = 64;

/**
 * One message: my bubbles on the right in my colour, others on the left in theirs, a group leader's in amber.
 * Right-click (or long-press on touch) opens the reaction bar; reactions show under the bubble, mine highlighted.
 */
@Component({
  selector: 'app-message-bubble',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatTooltipModule, ChatAvatar],
  templateUrl: './message-bubble.component.html',
  styleUrl: './message-bubble.component.scss',
})
export class MessageBubble {
  readonly message = input.required<ChatMessage>();
  readonly meId = input.required<string>();
  readonly members = input<ChatMember[]>([]);
  readonly settings = input.required<ChatSettings>();
  readonly group = input(false);
  /** First of a run from the same sender: shows avatar and name. */
  readonly first = input(true);

  readonly react = output<string>();
  /** Answer this message (Reply in the bar, or a swipe right on touch). */
  readonly reply = output<void>();
  /** The quote was clicked: show the quoted message. */
  readonly jump = output<string>();
  /** A photo finished loading (the chat keeps itself scrolled to the end). */
  readonly loaded = output<void>();

  private pressTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly kinds = MessageKind;
  protected readonly picking = signal(false);
  /** How far a touch swipe has pulled the bubble right (a reply at SWIPE_REPLY_PX). */
  protected readonly swipe = signal(0);
  protected readonly swipeReady = computed(() => this.swipe() >= SWIPE_REPLY_PX);
  private swipeFrom: { x: number; y: number } | null = null;
  /** The full emoji grid behind "+". */
  protected readonly more = signal(false);
  /** My current reaction, ringed in the bar (picking it again takes it back). */
  protected readonly myReaction = computed(
    () => this.message().reactions.find((r) => r.userIds.includes(this.meId()))?.emoji ?? null,
  );
  /** Open the bar under the bubble when it sits near the top (no room above for the "+" grid). */
  protected readonly below = signal(false);
  /** Emojis behind "+" that are not already in the quick row. */
  protected readonly extra = computed(() => {
    const quick = new Set(this.settings().reactions);
    return (this.settings().allReactions ?? []).filter((e) => !quick.has(e));
  });
  protected readonly mine = computed(() => this.message().sender.id === this.meId());
  protected readonly leader = computed(
    () => this.group() && this.message().sender.role === ParticipantRole.Admin,
  );
  protected readonly nameTint = computed(() => tintFor(this.message().sender.id));

  protected readonly colors = computed(() => {
    const s = this.settings();
    if (this.mine()) return BUBBLE_COLORS[s.myColor];
    return this.leader() ? LEADER_BUBBLE : BUBBLE_COLORS[s.othersColor];
  });

  protected readonly shape = computed(() => this.settings().bubbleStyle ?? BubbleStyle.Rounded);

  protected readonly images = computed(() =>
    this.message().attachments.filter((a) => a.mimeType.startsWith('image/')),
  );
  protected readonly videos = computed(() =>
    this.message().attachments.filter(
      (a) => a.mimeType.startsWith('video/') && this.message().kind !== MessageKind.Voice,
    ),
  );
  protected readonly audio = computed(() =>
    this.message().kind === MessageKind.Voice
      ? this.message().attachments
      : this.message().attachments.filter((a) => a.mimeType.startsWith('audio/')),
  );
  protected readonly documents = computed(() => {
    const shown = new Set([...this.images(), ...this.videos(), ...this.audio()]);
    return this.message().attachments.filter((a) => !shown.has(a));
  });

  /** The text with the @names of mentioned members highlighted. */
  protected readonly segments = computed<Segment[]>(() => {
    const body = this.message().body ?? '';
    const names = this.members()
      .filter((m) => this.message().mentions.includes(m.userId))
      .map((m) => `@${m.fullName}`);
    if (!names.length) return [{ text: body, mention: false }];
    const pattern = new RegExp(
      `(${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
      'g',
    );
    return body
      .split(pattern)
      .filter((part) => part !== '')
      .map((text) => ({ text, mention: names.includes(text) }));
  });

  protected readonly mentionsMe = computed(() => this.message().mentions.includes(this.meId()));

  /** Two blue ticks once every other member has read past this message. */
  protected readonly readByAll = computed(() => {
    const sent = this.message().createdAt;
    const others = this.members().filter((m) => !m.isMe);
    return others.length > 0 && others.every((m) => !!m.lastReadAt && m.lastReadAt >= sent);
  });

  protected readonly time = computed(() => clinicTime(new Date(this.message().createdAt)));

  protected size = fileSize;

  protected reactedByMe(userIds: string[]): boolean {
    return userIds.includes(this.meId());
  }

  protected openPicker(event: Event): void {
    event.preventDefault();
    this.placePicker(event.currentTarget);
    this.more.set(false);
    this.picking.set(true);
  }

  /** Room above the bubble inside the message list (the chat header sits over the rest). */
  private placePicker(bubble: EventTarget | null): void {
    if (!(bubble instanceof Element)) return;
    const listTop = bubble.closest('.messages')?.getBoundingClientRect().top ?? 0;
    this.below.set(bubble.getBoundingClientRect().top - listTop < PICKER_ROOM_PX);
  }

  protected close(): void {
    this.picking.set(false);
    this.more.set(false);
  }

  protected answer(): void {
    this.close();
    this.reply.emit();
  }

  protected pick(emoji: string): void {
    this.close();
    this.react.emit(emoji);
  }

  /** A long-press selects nothing on phones (the bar opens instead), so the bar offers Copy. */
  protected async copy(): Promise<void> {
    this.close();
    await navigator.clipboard?.writeText(this.message().body ?? '').catch(() => undefined);
  }

  protected pressStart(event: PointerEvent): void {
    if (event.pointerType !== 'touch') return;
    this.swipeFrom = { x: event.clientX, y: event.clientY };
    const bubble = event.currentTarget;
    this.pressTimer = setTimeout(() => {
      this.placePicker(bubble);
      this.more.set(false);
      this.picking.set(true);
      navigator.vibrate?.(12);
    }, LONG_PRESS_MS);
  }

  /** A touch moving sideways is a swipe (no long-press); vertical moves are scrolling. */
  protected pressMove(event: PointerEvent): void {
    if (!this.swipeFrom || event.pointerType !== 'touch') return;
    const dx = event.clientX - this.swipeFrom.x;
    const dy = Math.abs(event.clientY - this.swipeFrom.y);
    if (Math.abs(dx) > 8 || dy > 8) this.cancelPress();
    if (dy > 24 && this.swipe() === 0) {
      this.swipeFrom = null;
      return;
    }
    const pulled = Math.max(0, Math.min(dx, SWIPE_REPLY_PX + 16));
    if (pulled >= SWIPE_REPLY_PX && !this.swipeReady()) navigator.vibrate?.(8);
    this.swipe.set(pulled);
  }

  protected pressEnd(): void {
    this.cancelPress();
    if (this.swipeReady()) this.reply.emit();
    this.swipe.set(0);
    this.swipeFrom = null;
  }

  private cancelPress(): void {
    if (this.pressTimer) clearTimeout(this.pressTimer);
    this.pressTimer = null;
  }

  protected isImage(a: ChatAttachment): boolean {
    return a.mimeType.startsWith('image/');
  }

  /** Any press outside the bar closes it: beside the bubble, on it, or a right-click elsewhere (which may reopen). */
  @HostListener('document:pointerdown', ['$event'])
  protected closeOutside(event: Event): void {
    if (this.picking() && !(event.target as Element | null)?.closest?.('.picker')) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  @HostListener('document:wheel')
  protected closeQuietly(): void {
    if (this.picking()) this.close();
  }
}
