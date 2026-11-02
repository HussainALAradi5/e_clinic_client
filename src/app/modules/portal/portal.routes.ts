import { Routes } from '@angular/router';

const title = (page: string): string => `${page} · e-Clinic`;

/** `/portal` — the patient's own records (PortalLayout); unknown paths lead home. */
export const PORTAL_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: title('My portal'),
    loadComponent: () => import('@pages/portal/home/home.page').then((m) => m.PortalHomePage),
  },
  {
    path: 'appointments',
    title: title('My visits'),
    loadComponent: () =>
      import('@pages/portal/appointments/appointments.page').then((m) => m.MyAppointmentsPage),
  },
  {
    path: 'appointments/new',
    title: title('Book a visit'),
    loadComponent: () =>
      import('@pages/portal/booking/booking.page').then((m) => m.PortalBookingPage),
  },
  {
    path: 'treatments',
    title: title('My treatments'),
    loadComponent: () =>
      import('@pages/portal/treatments/treatments.page').then((m) => m.MyTreatmentsPage),
  },
  {
    path: 'results',
    title: title('My results'),
    loadComponent: () => import('@pages/portal/results/results.page').then((m) => m.MyResultsPage),
  },
  {
    path: 'sick-leaves',
    title: title('My sick leaves'),
    loadComponent: () =>
      import('@pages/portal/sick-leaves/sick-leaves.page').then((m) => m.MySickLeavesPage),
  },
  {
    path: 'prescriptions',
    title: title('My prescriptions'),
    loadComponent: () =>
      import('@pages/portal/prescriptions/prescriptions.page').then((m) => m.MyPrescriptionsPage),
  },
  {
    path: 'invoices',
    title: title('My invoices'),
    loadComponent: () =>
      import('@pages/portal/invoices/invoices.page').then((m) => m.MyInvoicesPage),
  },
  {
    path: 'notifications',
    title: title('Messages'),
    loadComponent: () =>
      import('@pages/portal/notifications/notifications.page').then(
        (m) => m.PortalNotificationsPage,
      ),
  },
  {
    path: 'profile',
    title: title('My profile'),
    loadComponent: () => import('@pages/portal/profile/profile.page').then((m) => m.MyProfilePage),
  },
  {
    path: 'security',
    title: title('Password & security'),
    loadComponent: () =>
      import('@pages/system/auth/account-security/account-security.page').then(
        (m) => m.AccountSecurityPage,
      ),
  },
  { path: '**', redirectTo: '' },
];
