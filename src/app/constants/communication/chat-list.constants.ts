import { ChatFilter } from '@enums/communication/chat-filter.enum';

/** Text of the chat list parts (filters, rows, empty / loading states). */
export const CHAT_LIST_TEXT = {
  searchPlaceholder: 'Search chats or people',
  searchLabel: 'Search chats',
  showLabel: 'Show',
  deleted: 'Deleted',
  deletedHint: 'Admins: show deleted chats (read-only, restorable)',
  dateLabel: 'Filter by date',
  date: 'Date',
  dateRange: (from: string, to: string) => `${from || '…'} → ${to || '…'}`,
  lastActivity: 'Last activity',
  from: 'From',
  to: 'To',
  clearDates: 'Clear dates',
  youLead: 'You lead this group',
  messages: (count: number) => `${count} messages`,
  unread: (count: number) => `${count} unread`,
  unreadShown: (count: number) => (count > 99 ? '99+' : String(count)),
  deletedBy: (name: string | null, at: string) => `Deleted by ${name ?? 'someone'} · ${at}`,
  noChats: 'No chats here',
  noChatsHint: 'Try another filter, or start a new chat.',
};

/** The list's filter chips, in order. */
export const CHAT_FILTER_CHIPS = [
  { value: ChatFilter.All, label: 'All', icon: 'forum' },
  { value: ChatFilter.Unread, label: 'Unread', icon: 'mark_chat_unread' },
  { value: ChatFilter.Groups, label: 'Groups', icon: 'groups' },
  { value: ChatFilter.Direct, label: 'One-to-one', icon: 'person' },
  { value: ChatFilter.Read, label: 'Read', icon: 'done_all' },
];

/** Rows drawn while the list loads. */
export const CHAT_LIST_SKELETON_ROWS = [1, 2, 3, 4, 5];
