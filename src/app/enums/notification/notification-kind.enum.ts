/**
 * What a message is about, so it looks and sounds different (worked out in the client from its template — see
 * notificationKindOf). Same values as the phone app's NotificationKind.
 */
export enum NotificationKind {
  Visit = 'visit',
  Treatment = 'treatment',
  Result = 'result',
  Pharmacy = 'pharmacy',
  Billing = 'billing',
  Hr = 'hr',
  Chat = 'chat',
  Support = 'support',
  Urgent = 'urgent',
  System = 'system',
}
