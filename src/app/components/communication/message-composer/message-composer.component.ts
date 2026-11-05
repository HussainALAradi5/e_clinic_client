import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  effect,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatMember } from '@interfaces/communication/chat-member.interface';
import { ChatMessage } from '@interfaces/communication/chat-message.interface';
import { SendMessagePayload } from '@interfaces/communication/send-message-payload.interface';
import { ChatAvatar } from '../chat-avatar/chat-avatar.component';
import { fileSize } from '@utilities/communication/chat-style';
import { MESSAGE_COMPOSER_TEXT } from '@constants/communication/message-composer.constants';

/** Same limits as the server (attachments config: chat_media). */
const MAX_FILES = 10;
const MAX_MB = 20;
export const CHAT_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf,text/plain,' +
  '.docx,.xlsx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Write a message: text with @mentions (type @ to pick a member), files from the picker or dropped on the chat,
 * or a voice note (tap the mic to record, tap again to send). Enter sends, Shift+Enter adds a line.
 */
@Component({
  selector: 'app-message-composer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonModule, MatIconModule, MatTooltipModule, ChatAvatar],
  templateUrl: './message-composer.component.html',
  styleUrl: './message-composer.component.scss',
})
export class MessageComposer implements OnDestroy {
  protected readonly labels = MESSAGE_COMPOSER_TEXT;

  readonly members = input<ChatMember[]>([]);
  readonly busy = input(false);
  /** The message being answered (shown above the box until sent or cancelled). */
  readonly replyTo = input<ChatMessage | null>(null);
  readonly meId = input('');
  readonly cancelReply = output<void>();
  readonly send = output<SendMessagePayload>();
  readonly rejected = output<string>();

  private readonly box = viewChild<ElementRef<HTMLTextAreaElement>>('box');

  protected readonly accept = CHAT_ACCEPT;
  protected readonly text = signal('');
  protected readonly files = signal<File[]>([]);
  protected readonly mentionQuery = signal<string | null>(null);
  protected readonly highlighted = signal(0);
  protected readonly recording = signal(false);
  protected readonly seconds = signal(0);
  private readonly mentioned = new Map<string, string>();
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Choosing Reply puts the cursor in the box, ready to type.
    effect(() => {
      if (this.replyTo()) this.box()?.nativeElement.focus();
    });
  }

  protected readonly suggestions = computed(() => {
    const query = this.mentionQuery();
    if (query === null) return [];
    const q = query.toLowerCase();
    return this.members()
      .filter((m) => !m.isMe && m.fullName.toLowerCase().includes(q))
      .slice(0, 6);
  });

  protected readonly canSend = computed(
    () => !this.busy() && (this.text().trim().length > 0 || this.files().length > 0),
  );

  protected readonly clock = computed(() => {
    const s = this.seconds();
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  });

  protected size = fileSize;

  /** Files picked or dropped on the chat. */
  addFiles(list: FileList | File[]): void {
    const incoming = [...list];
    const tooBig = incoming.filter((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig.length)
      this.rejected.emit(
        MESSAGE_COMPOSER_TEXT.filesOverMbCanT(MAX_MB, tooBig.map((f) => f.name).join(', ')),
      );
    const next = [...this.files(), ...incoming.filter((f) => !tooBig.includes(f))];
    if (next.length > MAX_FILES)
      this.rejected.emit(MESSAGE_COMPOSER_TEXT.upToFilesPerMessage(MAX_FILES));
    this.files.set(next.slice(0, MAX_FILES));
  }

  protected removeFile(file: File): void {
    this.files.update((list) => list.filter((f) => f !== file));
  }

  protected picked(input: HTMLInputElement): void {
    if (input.files) this.addFiles(input.files);
    input.value = '';
  }

  protected typed(value: string): void {
    this.text.set(value);
    const box = this.box()?.nativeElement;
    const upToCursor = value.slice(0, box?.selectionStart ?? value.length);
    const match = /(^|\s)@([\p{L} ]{0,30})$/u.exec(upToCursor);
    this.mentionQuery.set(match ? match[2] : null);
    this.highlighted.set(0);
  }

  protected choose(member: ChatMember): void {
    const box = this.box()?.nativeElement;
    const value = this.text();
    const cursor = box?.selectionStart ?? value.length;
    const start = value.slice(0, cursor).lastIndexOf('@');
    const next = `${value.slice(0, start)}@${member.fullName} ${value.slice(cursor)}`;
    this.mentioned.set(member.userId, member.fullName);
    this.text.set(next);
    this.mentionQuery.set(null);
    queueMicrotask(() => {
      const at = start + member.fullName.length + 2;
      box?.focus();
      box?.setSelectionRange(at, at);
    });
  }

  protected keydown(event: KeyboardEvent): void {
    const list = this.suggestions();
    if (list.length) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        this.highlighted.set((this.highlighted() + step + list.length) % list.length);
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        this.choose(list[this.highlighted()]);
        return;
      }
      if (event.key === 'Escape') {
        this.mentionQuery.set(null);
        return;
      }
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  protected submit(): void {
    if (!this.canSend()) return;
    const body = this.text().trim();
    // Only names still in the text count as mentions.
    const mentions = [...this.mentioned]
      .filter(([, name]) => body.includes(`@${name}`))
      .map(([id]) => id);
    this.send.emit({ body, files: this.files(), mentions });
    this.text.set('');
    this.files.set([]);
    this.mentioned.clear();
  }

  protected async toggleVoice(): Promise<void> {
    if (this.recording()) {
      this.recorder?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      this.chunks = [];
      this.recorder = new MediaRecorder(stream, { mimeType: type });
      this.recorder.ondataavailable = (e) => e.data.size && this.chunks.push(e.data);
      this.recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        this.stopClock();
        this.recording.set(false);
        const blob = new Blob(this.chunks, { type });
        if (blob.size > 0) {
          const ext = type === 'audio/webm' ? 'webm' : 'm4a';
          this.send.emit({ files: [new File([blob], `voice-note.${ext}`, { type })], voice: true });
        }
      };
      this.recorder.start();
      this.recording.set(true);
      this.seconds.set(0);
      this.timer = setInterval(() => this.seconds.update((s) => s + 1), 1000);
    } catch {
      this.rejected.emit(MESSAGE_COMPOSER_TEXT.microphoneNotAvailableAllowIt);
    }
  }

  protected cancelVoice(): void {
    if (!this.recorder) return;
    this.recorder.onstop = () => {
      this.recorder?.stream.getTracks().forEach((t) => t.stop());
      this.stopClock();
      this.recording.set(false);
    };
    this.recorder.stop();
  }

  private stopClock(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  ngOnDestroy(): void {
    this.cancelVoice();
  }
}
