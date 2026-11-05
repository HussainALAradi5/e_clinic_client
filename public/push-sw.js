// e-Clinic browser notifications (Web Push). The server sends { title, body, url, tag } for each in-app message
// while the person's phone and browser notifications are on; a tap opens (or focuses) the inbox.
// The message's kind from its template, for its picture (public/notifications, made by the phone repo's
// tools/make_icons.py). Same rules as src/app/utilities/notification-kind.ts (a worker cannot import it).
const URGENT = [
  'order.abnormal',
  'treatment.urgent',
  'treatment.attendance_alert',
  'patient.emergency_access',
];
const KIND_BY_AREA = {
  appointment: 'visit',
  treatment: 'treatment',
  order: 'result',
  prescription: 'pharmacy',
  pharmacy: 'pharmacy',
  refund: 'billing',
  expense: 'billing',
  invoice: 'billing',
  payment: 'billing',
  report: 'billing',
  leave: 'hr',
  attendance: 'hr',
  staff_request: 'hr',
  payroll: 'hr',
  chat: 'chat',
  ticket: 'support',
  task: 'files',
};
const kindOf = (template) =>
  !template
    ? 'system'
    : URGENT.includes(template)
      ? 'urgent'
      : KIND_BY_AREA[template.split('.')[0]] || 'system';

self.addEventListener('push', (event) => {
  let message = {};
  try {
    message = event.data ? event.data.json() : {};
  } catch {
    message = { body: event.data ? event.data.text() : '' };
  }
  // Open tabs play the kind's own sound (a notification cannot choose its sound).
  const tell = self.clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then((windows) =>
      windows.forEach((w) => w.postMessage({ type: 'clinic-push', template: message.template })),
    );
  event.waitUntil(
    Promise.all([
      tell,
      self.registration.showNotification(message.title || 'e-Clinic', {
        body: message.body || '',
        tag: message.tag,
        icon: `/notifications/notify-${kindOf(message.template)}.png`,
        badge: '/icons/icon-192.png',
        data: { url: message.url || '/' },
      }),
    ]),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => w.url.startsWith(self.location.origin));
      if (open) {
        open.navigate(url);
        return open.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
