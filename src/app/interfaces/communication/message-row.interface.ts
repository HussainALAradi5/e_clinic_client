import { ChatMessage } from '@interfaces/communication/chat-message.interface';

export interface MessageRow {
  message: ChatMessage;
  day: string | null;
  first: boolean;
}
