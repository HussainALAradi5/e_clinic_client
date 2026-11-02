import { NotificationChannel } from '@enums/notification/notification-channel.enum';
import { NotificationStatus } from '@enums/notification/notification-status.enum';

/** Mirror of NotificationResource (inbox and delivery log; destination masked for non-admins). */
export interface AppNotification {
  id: string;
  channel: NotificationChannel;
  template: string;
  locale: string;
  destination: string | null;
  subject: string | null;
  body: string;
  relatedType: string | null;
  relatedId: string | null;
  status: NotificationStatus;
  scheduledFor: string;
  attempts: number;
  lastError: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  person?: { id: string; fullName: string };
}
