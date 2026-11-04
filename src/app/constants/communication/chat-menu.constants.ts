import { MuteDuration } from '@enums/communication/mute-duration.enum';

/** Text of the chat header's ⋮ menu and of muted chats. */
export const CHAT_MENU_TEXT = {
  more: 'More options',
  info: 'Chat info',
  groupInfo: 'Group info',
  mute: 'Mute notifications',
  unmute: 'Unmute',
  muted: 'Muted',
  mutedUntil: (until: string) => `Muted until ${until}`,
  mutedDone: 'Chat muted — no pop-ups or badge from it; mentions still reach you.',
  unmutedDone: 'Chat unmuted.',
  contact: 'Contact',
  call: 'Call',
  email: 'Email',
};

/** The mute choices, shortest first. */
export const MUTE_CHOICES: { value: MuteDuration; label: string }[] = [
  { value: MuteDuration.EightHours, label: '8 hours' },
  { value: MuteDuration.OneWeek, label: '1 week' },
  { value: MuteDuration.Always, label: 'Until I unmute' },
];
