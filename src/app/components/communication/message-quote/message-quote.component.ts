import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MESSAGE_PARTS_TEXT } from '@constants/communication/message-parts.constants';
import { MessageKind } from '@enums/communication/message-kind.enum';
import { ChatReplyQuote } from '@interfaces/communication/chat-reply-quote.interface';

/** The message a reply answers: a tinted card with the sender's name; click to show the original. */
@Component({
  selector: 'app-message-quote',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './message-quote.component.html',
  styleUrl: './message-quote.component.scss',
})
export class MessageQuote {
  readonly quote = input.required<ChatReplyQuote>();
  readonly meId = input('');
  /** Show the original message (its id). */
  readonly jump = output<string>();

  protected readonly text = MESSAGE_PARTS_TEXT;
  protected readonly kinds = MessageKind;
}
