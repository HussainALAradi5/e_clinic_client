import { NotificationKind } from '@enums/notification/notification-kind.enum';
import { notificationKindOf } from './notification-kind';

describe('notificationKindOf', () => {
  it('takes the kind from the template area; urgent templates win', () => {
    expect(notificationKindOf('appointment.reminder')).toBe(NotificationKind.Visit);
    expect(notificationKindOf('order.result_ready')).toBe(NotificationKind.Result);
    expect(notificationKindOf('order.abnormal')).toBe(NotificationKind.Urgent);
    expect(notificationKindOf('prescription.created')).toBe(NotificationKind.Pharmacy);
    expect(notificationKindOf('refund.approved')).toBe(NotificationKind.Billing);
    expect(notificationKindOf('leave.approved')).toBe(NotificationKind.Hr);
    expect(notificationKindOf('chat.mention')).toBe(NotificationKind.Chat);
    expect(notificationKindOf('ticket.resolved')).toBe(NotificationKind.Support);
    expect(notificationKindOf('task.completed')).toBe(NotificationKind.Files);
    expect(notificationKindOf('report.month_summary')).toBe(NotificationKind.Billing);
    expect(notificationKindOf('welcome.sent')).toBe(NotificationKind.System);
    expect(notificationKindOf(null)).toBe(NotificationKind.System);
  });
});
