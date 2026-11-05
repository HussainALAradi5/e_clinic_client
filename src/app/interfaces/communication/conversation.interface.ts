import { ConversationType } from '@enums/communication/chat.enum';
import { ParticipantRole } from '@enums/communication/participant-role.enum';
import { PresenceStatus } from '@enums/identity/presence-status.enum';
import { ChatMember } from '@interfaces/communication/chat-member.interface';
import { ChatMessage } from '@interfaces/communication/chat-message.interface';

export interface Conversation {
  id: string;
  type: ConversationType;
  title: string;
  partnerId: string | null;
  /** The other person's Online / Offline status (one-to-one chats). */
  partnerPresence: PresenceStatus | null;
  avatarUrl: string | null;
  myRole: ParticipantRole | null;
  /** I muted this chat: no pop-ups or badge from it (mentions still notify). */
  muted: boolean;
  /** When my mute ends by itself; null = until I unmute. */
  mutedUntil: string | null;
  members: ChatMember[];
  lastMessage: ChatMessage | null;
  unreadCount: number;
  messagesCount?: number;
  lastMessageAt: string | null;
  createdAt: string | null;
  /** Soft-deleted (admins see these with the Deleted switch); never removed. */
  /** I left this group: it stays on my list, read-only, until I delete it. */
  left: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
}
