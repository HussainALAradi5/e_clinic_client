import {
  BubbleColor,
  BubbleStyle,
  ConversationType,
  MessageKind,
  ParticipantRole,
} from '@shared/enums/communication/chat.enum';
import { UserType } from '@shared/enums/identity/user-type.enum';

/** GET /chat/contacts — a colleague who can be messaged. */
export interface ChatContact {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  userType: UserType;
}

/** A member of a chat with the badges shown next to their name. */
export interface ChatMember {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  userType: UserType;
  role: ParticipantRole;
  isMe: boolean;
  lastReadAt: string | null;
}

export interface ChatAttachment {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  /** Short-lived link; null until the file passed the scan. */
  url: string | null;
}

export interface ChatReaction {
  emoji: string;
  count: number;
  userIds: string[];
  names: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  kind: MessageKind;
  body: string | null;
  mentions: string[];
  sender: { id: string; fullName: string; avatarUrl: string | null; role: ParticipantRole | null };
  attachments: ChatAttachment[];
  reactions: ChatReaction[];
  createdAt: string;
}

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
}

/** GET /chat/conversations filters (all applied on the server). */
export interface ConversationQuery {
  search?: string;
  type?: ConversationType;
  read?: 'unread' | 'read';
  from?: string;
  to?: string;
  page?: number;
  perPage?: number;
}

export interface NewChatPayload {
  type: ConversationType;
  userId?: string;
  title?: string;
  memberIds?: string[];
}

/** What the composer sends: text, files (or a voice note) and the members it @mentions. */
export interface SendMessagePayload {
  body?: string;
  files?: File[];
  voice?: boolean;
  mentions?: string[];
}

export interface ChatSettings {
  bubbleStyle: BubbleStyle;
  myColor: BubbleColor;
  othersColor: BubbleColor;
  /** New messages pop up as toasts. */
  notifyMessages: boolean;
  /** Unread chat messages count in the chat badge. */
  countInBadge: boolean;
  /** The reaction emojis offered (read-only). */
  reactions: string[];
}

/** Socket `conversation.read`. */
export interface ReadReceipt {
  conversationId: string;
  userId: string;
  readAt: string;
}
