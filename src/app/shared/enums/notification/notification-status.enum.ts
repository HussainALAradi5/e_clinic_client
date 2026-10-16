/** Mirror of NotificationStatus — queued → sent → delivered | failed | cancelled. */
export enum NotificationStatus {
  Queued = 'queued',
  Sent = 'sent',
  Delivered = 'delivered',
  Failed = 'failed',
  Cancelled = 'cancelled',
}
