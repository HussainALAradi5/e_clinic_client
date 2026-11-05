import { AppNotification } from '@interfaces/notification/notification.interface';

/** What the message dialog shows: the notification, and where its button leads (null: no page for it). */
export interface NotificationMessageData {
  notification: AppNotification;
  link: string | null;
  /** The button, e.g. "Open result". */
  linkLabel: string;
}
