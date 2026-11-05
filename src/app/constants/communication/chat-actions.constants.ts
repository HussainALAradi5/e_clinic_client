/** Text of the chat actions shared by the list's right-click menu and the open chat's ⋮ menu. */
export const CHAT_ACTIONS_TEXT = {
  open: 'Open',
  markRead: 'Mark as read',
  leave: 'Exit group',
  leaveTitle: (title: string) => `Exit "${title}"?`,
  leaveMessage:
    'You stop getting its messages and can no longer write in it. It stays in your chats, read-only, until you delete it.',
  left: (title: string) => `You left "${title}".`,
  deleteChat: 'Delete chat',
  deleteTitle: (title: string) => `Delete "${title}" from your chats?`,
  deleteDirectMessage:
    'It goes from your list only; the other person keeps it. If they write again, the chat comes back with the new messages.',
  deleteGroupMessage: 'It goes from your list only; the members keep it. Nothing is erased.',
  deleted: 'Chat deleted from your list.',
  deleteForEveryone: 'Delete for everyone',
  deleteForEveryoneMessage:
    'The chat disappears for every member. Nothing is erased — you can restore it from the Deleted list.',
  restore: 'Restore chat',
  restored: (title: string) => `"${title}" is back for its members.`,
  youLeft: 'You left this group. You can still read it, not write in it.',
  leftRow: 'You left this group',
};

/** Text of my Online / Offline switch in the chat list. */
export const PRESENCE_TEXT = {
  online: 'Online',
  offline: 'Offline',
  goOffline: 'You show as online — click to appear offline',
  goOnline: 'You show as offline — click to appear online',
  isOnline: 'Online',
  isOffline: 'Offline',
};

/** Live Online / Offline of colleagues (Reverb private channel and event, as in the server's routes/channels.php). */
export const PRESENCE_CHANNEL = 'staff.presence';
export const PRESENCE_EVENT = 'presence.changed';
