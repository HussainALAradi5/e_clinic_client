import { MessageKind } from '@enums/communication/message-kind.enum';

/** The message a reply quotes (null when the quoted message was deleted). */
export interface ChatReplyQuote {
  id: string;
  senderId: string;
  senderName: string;
  kind: MessageKind;
  excerpt: string;
  fileName: string | null;
}
