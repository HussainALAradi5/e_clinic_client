import { NotificationKind } from '@enums/notification/notification-kind.enum';

/** Material Symbols icon per kind of message (colours are in STATUS_TONES.NotificationKind). */
export const NOTIFICATION_KIND_ICONS: Record<NotificationKind, string> = {
  [NotificationKind.Visit]: 'event',
  [NotificationKind.Treatment]: 'self_improvement',
  [NotificationKind.Result]: 'biotech',
  [NotificationKind.Pharmacy]: 'medication',
  [NotificationKind.Billing]: 'payments',
  [NotificationKind.Hr]: 'badge',
  [NotificationKind.Chat]: 'forum',
  [NotificationKind.Support]: 'support_agent',
  [NotificationKind.Urgent]: 'priority_high',
  [NotificationKind.System]: 'notifications',
};

/** Sound per kind (public/sounds, made by the phone repo's tools/make_notification_sounds.py; same as the app). */
export const NOTIFICATION_KIND_SOUNDS: Record<NotificationKind, string> = Object.fromEntries(
  Object.values(NotificationKind).map((kind) => [kind, `/sounds/notify-${kind}.wav`]),
) as Record<NotificationKind, string>;
