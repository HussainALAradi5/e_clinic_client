import { MessageKind } from '@enums/communication/message-kind.enum';
import { ParticipantRole } from '@enums/communication/participant-role.enum';
import { ChatAttachment } from '@interfaces/communication/chat-attachment.interface';
import { ChatReaction } from '@interfaces/communication/chat-reaction.interface';
import { ChatReplyQuote } from '@interfaces/communication/chat-reply-quote.interface';

export interface ChatMessage {
  id: string;
  conversationId: string;
  kind: MessageKind;
  body: string | null;
  mentions: string[];
  sender: { id: string; fullName: string; avatarUrl: string | null; role: ParticipantRole | null };
  replyTo: ChatReplyQuote | null;
  attachments: ChatAttachment[];
  reactions: ChatReaction[];
  createdAt: string;
}
