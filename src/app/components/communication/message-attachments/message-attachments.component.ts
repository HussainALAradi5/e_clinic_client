import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MESSAGE_PARTS_TEXT } from '@constants/communication/message-parts.constants';
import { MessageKind } from '@enums/communication/message-kind.enum';
import { ChatMessage } from '@interfaces/communication/chat-message.interface';
import { fileSize } from '@utilities/communication/chat-style';

/** A message's files inside its bubble: photos (a grid when several), videos, voice notes / audio, other files. */
@Component({
  selector: 'app-message-attachments',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './message-attachments.component.html',
  styleUrl: './message-attachments.component.scss',
})
export class MessageAttachments {
  readonly message = input.required<ChatMessage>();
  /** A photo finished loading (the list keeps its scroll position). */
  readonly loaded = output<void>();

  protected readonly text = MESSAGE_PARTS_TEXT;
  protected readonly kinds = MessageKind;
  protected readonly size = fileSize;

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
}
