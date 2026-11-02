import { ConversationType } from '@enums/communication/chat.enum';
import { ParticipantRole } from '@enums/communication/participant-role.enum';
import { ChatMember } from '@interfaces/communication/chat-member.interface';
import { ChatMessage } from '@interfaces/communication/chat-message.interface';

export interface Conversation {
  id: string;
  type: ConversationType;
  title: string;
  partnerId: string | null;
  avatarUrl: string | null;
  myRole: ParticipantRole | null;
  members: ChatMember[];
  lastMessage: ChatMessage | null;
  unreadCount: number;
  messagesCount?: number;
  lastMessageAt: string | null;
  createdAt: string | null;
  /** Soft-deleted (admins see these with the Deleted switch); never removed. */
  deletedAt: string | null;
  deletedBy: string | null;
}
