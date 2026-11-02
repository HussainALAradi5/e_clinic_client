import { Routes } from '@angular/router';
import { environment } from '@env';
import { authGuard, guestGuard, patientGuard, staffGuard } from '@middlewares/guards/auth.guards';
import { AUTH_ROUTES } from '@modules/system/auth.routes';

export const routes: Routes = [
  // Public website: everyone, signed in or not.
  {
    path: '',
    loadComponent: () =>
      import('@components/layout/public/public.layout').then((m) => m.PublicLayout),
    loadChildren: () => import('@modules/public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },

  // Sign-in and password pages (signed-out users only).
  {
    path: '',
    canMatch: [guestGuard],
    loadComponent: () => import('@components/layout/auth/auth.layout').then((m) => m.AuthLayout),
    children: AUTH_ROUTES,
  },

  // Printable documents (referral letters, consent forms) without the app chrome.
  {
    path: 'print',
    canMatch: [authGuard],
    loadChildren: () =>
      Promise.all([
        import('@modules/clinic/print.routes'),
        import('@modules/billing/print.routes'),
        import('@modules/pharmacy/print.routes'),
        import('@modules/hr/print.routes'),
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
    loadComponent: () =>
      import('@components/layout/portal/portal.layout').then((m) => m.PortalLayout),
    loadChildren: () => import('@modules/portal/portal.routes').then((m) => m.PORTAL_ROUTES),
  },

  // Signed-in staff app (patients are sent to their portal).
  {
    path: '',
    loadComponent: () => import('@components/layout/shell/shell.layout').then((m) => m.ShellLayout),
    canMatch: [authGuard, staffGuard],
    children: [
      // Signed-in users opening a sign-in or portal link go to their workspace.
      { path: 'login', redirectTo: 'dashboard' },
      { path: 'portal', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · e-Clinic',
        loadComponent: () => import('@pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'account/security',
        title: 'Account & security · e-Clinic',
        loadComponent: () =>
          import('@pages/system/auth/account-security/account-security.page').then(
            (m) => m.AccountSecurityPage,
          ),
      },
      {
        path: 'system',
        loadChildren: () => import('@modules/system/system.routes').then((m) => m.SYSTEM_ROUTES),
      },
      {
        path: 'clinic',
        loadChildren: () => import('@modules/clinic/clinic.routes').then((m) => m.CLINIC_ROUTES),
      },
      {
        path: 'hr',
        loadChildren: () => import('@modules/hr/hr.routes').then((m) => m.HR_ROUTES),
      },
      {
        path: 'billing',
        loadChildren: () => import('@modules/billing/billing.routes').then((m) => m.BILLING_ROUTES),
      },
      {
        path: 'pharmacy',
        loadChildren: () =>
          import('@modules/pharmacy/pharmacy.routes').then((m) => m.PHARMACY_ROUTES),
      },
      {
        path: 'accounting',
        loadChildren: () =>
          import('@modules/accounting/accounting.routes').then((m) => m.ACCOUNTING_ROUTES),
      },
      {
        path: 'chat',
        loadChildren: () =>
          import('@modules/communication/communication.routes').then((m) => m.CHAT_ROUTES),
      },
      {
        path: 'notifications',
        title: 'Notifications · e-Clinic',
        loadComponent: () =>
          import('@pages/system/notifications/my-notifications/my-notifications.page').then(
            (m) => m.MyNotificationsPage,
          ),
      },
      {
        path: 'support',
        loadChildren: () =>
          import('@modules/communication/communication.routes').then((m) => m.SUPPORT_ROUTES),
      },
      {
        path: 'reference',
        loadChildren: () =>
          import('@modules/reference/reference.routes').then((m) => m.REFERENCE_ROUTES),
      },
      ...(environment.production
        ? []
        : [
            {
              path: 'dev/ui-kit',
              title: 'UI kit · e-Clinic',
              loadComponent: () => import('@pages/dev/ui-kit/ui-kit.page').then((m) => m.UiKitPage),
            },
          ]),
      {
        path: 'forbidden',
        title: 'No access · e-Clinic',
        loadComponent: () =>
          import('@pages/common/forbidden/forbidden.page').then((m) => m.ForbiddenPage),
      },
      {
        path: '**',
        title: 'Not found · e-Clinic',
        loadComponent: () =>
          import('@pages/common/not-found/not-found.page').then((m) => m.NotFoundPage),
      },
    ],
  },
];
