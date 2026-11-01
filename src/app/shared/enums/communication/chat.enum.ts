/** Mirror of App\Enums\Communication\ConversationType. */
export enum ConversationType {
  Direct = 'direct',
  Group = 'group',
}

/** Mirror of App\Enums\Communication\ParticipantRole — `admin` is shown as "Leader". */
export enum ParticipantRole {
  Admin = 'admin',
  Member = 'member',
}

/** Mirror of App\Enums\Communication\MessageKind. */
export enum MessageKind {
  Text = 'text',
  Media = 'media',
  Voice = 'voice',
}

/** Mirror of App\Enums\Communication\BubbleStyle. */
export enum BubbleStyle {
  Rounded = 'rounded',
  Square = 'square',
  Minimal = 'minimal',
}

/** Mirror of App\Enums\Communication\BubbleColor. */
export enum BubbleColor {
  Blue = 'blue',
  Green = 'green',
  Teal = 'teal',
  Purple = 'purple',
  Rose = 'rose',
  Slate = 'slate',
}

/** Chat list chips: all, groups, one-to-one, unread, read (sent to the server as `type` / `read`). */
export enum ChatFilter {
  All = 'all',
  Groups = 'groups',
  Direct = 'direct',
  Unread = 'unread',
  Read = 'read',
}
