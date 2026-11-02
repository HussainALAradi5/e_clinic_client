import { ConversationType } from '@enums/communication/chat.enum';

export interface NewChatPayload {
  type: ConversationType;
  userId?: string;
  title?: string;
  memberIds?: string[];
}
