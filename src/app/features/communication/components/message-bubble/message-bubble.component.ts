import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BubbleStyle, MessageKind, ParticipantRole } from '@shared/enums/communication/chat.enum';
import {
  ChatAttachment,
  ChatMember,
  ChatMessage,
  ChatSettings,
} from '@shared/interfaces/communication/chat.interface';
import { clinicTime } from '@shared/utils/clinic-time';
import { ChatAvatar } from '../chat-avatar/chat-avatar.component';
import { BUBBLE_COLORS, fileSize, LEADER_BUBBLE, tintFor } from '../../utils/chat-style';

const LONG_PRESS_MS = 450;

interface Segment {
  text: string;
  mention: boolean;
}

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
  /** A photo finished loading (the chat keeps itself scrolled to the end). */
  readonly loaded = output<void>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private pressTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly kinds = MessageKind;
  protected readonly picking = signal(false);
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
    this.picking.set(true);
  }

  protected pick(emoji: string): void {
    this.picking.set(false);
    this.react.emit(emoji);
  }

  protected pressStart(event: PointerEvent): void {
    if (event.pointerType !== 'touch') return;
    this.pressTimer = setTimeout(() => this.picking.set(true), LONG_PRESS_MS);
  }

  protected pressEnd(): void {
    if (this.pressTimer) clearTimeout(this.pressTimer);
    this.pressTimer = null;
  }

  protected isImage(a: ChatAttachment): boolean {
    return a.mimeType.startsWith('image/');
  }

  @HostListener('document:pointerdown', ['$event'])
  protected closeOutside(event: Event): void {
    if (this.picking() && !this.host.nativeElement.contains(event.target as Node)) {
      this.picking.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void {
    this.picking.set(false);
  }
}
