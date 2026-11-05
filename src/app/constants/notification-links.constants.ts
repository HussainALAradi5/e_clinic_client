import { AppNotification } from '@interfaces/notification/notification.interface';

/**
 * Where an in-app notification leads, by its related record alias (the server's morph map): the record's page
 * (`:id`) or, for records shown only in a list, that list. Shared by the bell and the inbox page.
 */
export const NOTIFICATION_ROUTES: Readonly<Record<string, string>> = {
  background_task: '/system/background-tasks/:id',
  attachment: '/system/attachments',
  user: '/system/users/:id',
  role: '/system/roles-permissions/:id',
  person: '/system/people',
  company: '/reference/companies/:id',
  account: '/accounting/chart-of-accounts/:id',
  expense: '/accounting/expenses/:id',
  department: '/hr/departments/:id',
  employee: '/hr/employees/:id',
  // Check-in / check-out notices (late, on time, overtime) go to the employee's own day.
  attendance: '/hr/me',
  leave_request: '/hr/leaves/:id',
  staff_request: '/hr/requests',
  payroll_run: '/hr/payroll/:id',
  payslip: '/hr/me',
  patient: '/clinic/patients/:id',
  doctor: '/clinic/doctors/:id',
  room: '/clinic/rooms/:id',
  appointment: '/clinic/appointments/:id',
  sick_leave: '/clinic/sick-leaves',
  treatment: '/clinic/treatments/:id',
  clinical_order: '/clinic/clinical-orders/:id',
  billable_service: '/billing/service-catalog/:id',
  invoice: '/billing/invoices/:id',
  payment: '/billing/payments',
  refund: '/billing/refunds',
  insurance_claim: '/billing/insurance-claims/:id',
  cash_session: '/billing/cash-drawers/:id',
  medication: '/pharmacy/medications/:id',
  medication_batch: '/pharmacy/stock',
  prescription: '/pharmacy/prescriptions/:id',
  dispensation: '/pharmacy/dispensations/:id',
  support_ticket: '/support/tickets/:id',
  conversation: '/chat?c=:id',
};

/** The button to a notification's place, by its related record ("Open result"). */
export const NOTIFICATION_LINK_LABELS: Readonly<Record<string, string>> = {
  background_task: 'Open export',
  attachment: 'Open files',
  user: 'Open user',
  role: 'Open role',
  person: 'Open people',
  company: 'Open company',
  account: 'Open account',
  expense: 'Open expense',
  department: 'Open department',
  employee: 'Open employee',
  attendance: 'Open my attendance',
  leave_request: 'Open leave request',
  staff_request: 'Open request',
  payroll_run: 'Open payroll',
  payslip: 'Open payslip',
  patient: 'Open patient',
  doctor: 'Open doctor',
  room: 'Open room',
  appointment: 'Open appointment',
  sick_leave: 'Open sick leave',
  treatment: 'Open treatment',
  clinical_order: 'Open result',
  billable_service: 'Open service',
  invoice: 'Open invoice',
  payment: 'Open payments',
  refund: 'Open refunds',
  insurance_claim: 'Open claim',
  cash_session: 'Open cash drawer',
  medication: 'Open medication',
  medication_batch: 'Open stock',
  prescription: 'Open prescription',
  dispensation: 'Open dispensing',
  support_ticket: 'Open ticket',
  conversation: 'Open chat',
};

/** The button label for a related record; "Open" when there is no specific one. */
export function notificationLinkLabel(relatedType: string | null): string {
  return (relatedType && NOTIFICATION_LINK_LABELS[relatedType]) || 'Open';
}

/** "What it is about" choices on the inbox page (related record aliases). */
export const NOTIFICATION_TOPICS: readonly { value: string; label: string; icon: string }[] = [
  { value: 'support_ticket', label: 'Support tickets', icon: 'support_agent' },
  { value: 'conversation', label: 'Chat', icon: 'forum' },
  { value: 'appointment', label: 'Appointments', icon: 'event' },
  { value: 'treatment', label: 'Treatments', icon: 'healing' },
  { value: 'clinical_order', label: 'Orders & results', icon: 'biotech' },
  { value: 'prescription', label: 'Prescriptions', icon: 'medication' },
  { value: 'leave_request', label: 'Leave', icon: 'beach_access' },
  { value: 'payslip', label: 'Payslips', icon: 'payments' },
  { value: 'invoice', label: 'Invoices', icon: 'receipt_long' },
  { value: 'background_task', label: 'Exports & tasks', icon: 'cloud_download' },
];

/** The page a notification opens, or null when it is not about a record the app shows. */
export function notificationLink(
  n: Pick<AppNotification, 'relatedType' | 'relatedId'>,
): string | null {
  const route = n.relatedType ? NOTIFICATION_ROUTES[n.relatedType] : undefined;
  if (!route || (route.includes(':id') && !n.relatedId)) return null;
  return route.replace(':id', n.relatedId ?? '');
}
