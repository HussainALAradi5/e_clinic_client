import { ConversationType } from '@enums/communication/chat.enum';

/** GET /chat/conversations filters (all applied on the server). */
export interface ConversationQuery {
  search?: string;
  type?: ConversationType;
  read?: 'unread' | 'read';
  from?: string;
  to?: string;
  /** Admins: every deleted chat instead of mine. */
  deleted?: 1;
  page?: number;
  perPage?: number;
}
