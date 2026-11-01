import { Routes } from '@angular/router';
import { environment } from '@env';
import { authGuard, guestGuard, patientGuard, staffGuard } from '@core/guards/auth.guards';
import { AUTH_ROUTES } from './features/system/auth/auth.routes';

export const routes: Routes = [
  // Public website: everyone, signed in or not.
  {
    path: '',
    loadComponent: () => import('./core/layout/public/public.layout').then((m) => m.PublicLayout),
    loadChildren: () => import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },

  // Sign-in and password pages (signed-out users only).
  {
    path: '',
    canMatch: [guestGuard],
    loadComponent: () => import('./core/layout/auth/auth.layout').then((m) => m.AuthLayout),
    children: AUTH_ROUTES,
  },

  // Printable documents (referral letters, consent forms) without the app chrome.
  {
    path: 'print',
    canMatch: [authGuard],
    loadChildren: () =>
      Promise.all([
        import('./features/clinic/print.routes'),
        import('./features/billing/print.routes'),
        import('./features/pharmacy/print.routes'),
        import('./features/hr/print.routes'),
      ]).then(([clinic, billing, pharmacy, hr]) => [
        ...clinic.PRINT_ROUTES,
        ...billing.BILLING_PRINT_ROUTES,
        ...pharmacy.PHARMACY_PRINT_ROUTES,
        ...hr.HR_PRINT_ROUTES,
      ]),
  },

  // Patient portal (patients only; the same API returns only their own records).
  {
    path: 'portal',
    canMatch: [authGuard, patientGuard],
    loadComponent: () => import('./core/layout/portal/portal.layout').then((m) => m.PortalLayout),
    loadChildren: () => import('./features/portal/portal.routes').then((m) => m.PORTAL_ROUTES),
  },

  // Signed-in staff app (patients are sent to their portal).
  {
    path: '',
    loadComponent: () => import('./core/layout/shell/shell.layout').then((m) => m.ShellLayout),
    canMatch: [authGuard, staffGuard],
    children: [
      // Signed-in users opening a sign-in or portal link go to their workspace.
      { path: 'login', redirectTo: 'dashboard' },
      { path: 'portal', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · e-Clinic',
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'account/security',
        title: 'Account & security · e-Clinic',
        loadComponent: () =>
          import('./features/system/auth/pages/account-security/account-security.page').then(
            (m) => m.AccountSecurityPage,
          ),
      },
      {
        path: 'system',
        loadChildren: () => import('./features/system/system.routes').then((m) => m.SYSTEM_ROUTES),
      },
      {
        path: 'clinic',
        loadChildren: () => import('./features/clinic/clinic.routes').then((m) => m.CLINIC_ROUTES),
      },
      {
        path: 'hr',
        loadChildren: () => import('./features/hr/hr.routes').then((m) => m.HR_ROUTES),
      },
      {
        path: 'billing',
        loadChildren: () =>
          import('./features/billing/billing.routes').then((m) => m.BILLING_ROUTES),
      },
      {
        path: 'pharmacy',
        loadChildren: () =>
          import('./features/pharmacy/pharmacy.routes').then((m) => m.PHARMACY_ROUTES),
      },
      {
        path: 'accounting',
        loadChildren: () =>
          import('./features/accounting/accounting.routes').then((m) => m.ACCOUNTING_ROUTES),
      },
      {
        path: 'chat',
        loadChildren: () =>
          import('./features/communication/communication.routes').then((m) => m.CHAT_ROUTES),
      },
      {
        path: 'notifications',
        title: 'Notifications · e-Clinic',
        loadComponent: () =>
          import('./features/system/notifications/pages/my-notifications/my-notifications.page').then(
            (m) => m.MyNotificationsPage,
          ),
      },
      {
        path: 'support',
        loadChildren: () =>
          import('./features/communication/communication.routes').then((m) => m.SUPPORT_ROUTES),
      },
      {
        path: 'reference',
        loadChildren: () =>
          import('./features/reference/reference.routes').then((m) => m.REFERENCE_ROUTES),
      },
      ...(environment.production
        ? []
        : [
            {
              path: 'dev/ui-kit',
              title: 'UI kit · e-Clinic',
              loadComponent: () => import('./dev/ui-kit/ui-kit.page').then((m) => m.UiKitPage),
            },
          ]),
      {
        path: 'forbidden',
        title: 'No access · e-Clinic',
        loadComponent: () =>
          import('./core/pages/forbidden/forbidden.page').then((m) => m.ForbiddenPage),
      },
      {
        path: '**',
        title: 'Not found · e-Clinic',
        loadComponent: () =>
          import('./core/pages/not-found/not-found.page').then((m) => m.NotFoundPage),
      },
    ],
  },
];
