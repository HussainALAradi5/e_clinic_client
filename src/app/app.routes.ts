import { Routes } from '@angular/router';
import { environment } from '@env';
import { authGuard, guestGuard } from '@core/guards/auth.guards';
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

  // Signed-in staff app.
  {
    path: '',
    loadComponent: () => import('./core/layout/shell/shell.layout').then((m) => m.ShellLayout),
    canMatch: [authGuard],
    children: [
      // Signed-in users opening a sign-in link go to their workspace.
      { path: 'login', redirectTo: 'dashboard' },
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
