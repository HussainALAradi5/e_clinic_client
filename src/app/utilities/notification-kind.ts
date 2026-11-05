import { NotificationKind } from '@enums/notification/notification-kind.enum';

/** Templates that need attention now, whatever their area. */
const URGENT = new Set([
  'order.abnormal',
  'treatment.urgent',
  'treatment.attendance_alert',
  'patient.emergency_access',
]);

/** Template area → kind (`appointment.reminder` → visit); unknown areas are System. */
const BY_AREA: Record<string, NotificationKind> = {
  appointment: NotificationKind.Visit,
  treatment: NotificationKind.Treatment,
  order: NotificationKind.Result,
  prescription: NotificationKind.Pharmacy,
  pharmacy: NotificationKind.Pharmacy,
  refund: NotificationKind.Billing,
  expense: NotificationKind.Billing,
  invoice: NotificationKind.Billing,
  payment: NotificationKind.Billing,
  report: NotificationKind.Billing,
  leave: NotificationKind.Hr,
  attendance: NotificationKind.Hr,
  staff_request: NotificationKind.Hr,
  payroll: NotificationKind.Hr,
  chat: NotificationKind.Chat,
  ticket: NotificationKind.Support,
  task: NotificationKind.Files,
};

/** The kind of a message from its server template. */
export function notificationKindOf(template: string | null | undefined): NotificationKind {
  if (!template) {
    return NotificationKind.System;
  }
  if (URGENT.has(template)) {
    return NotificationKind.Urgent;
  }
  return BY_AREA[template.split('.')[0]] ?? NotificationKind.System;
}
