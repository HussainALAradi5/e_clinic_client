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
  payroll_run: '/hr/payroll/:id',
  payslip: '/hr/me',
  patient: '/clinic/patients/:id',
  doctor: '/clinic/doctors/:id',
  room: '/clinic/rooms/:id',
  appointment: '/clinic/appointments/:id',
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

