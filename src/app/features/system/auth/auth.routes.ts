import { Routes } from '@angular/router';

/** Public sign-in and password pages, rendered inside AuthLayout (signed-out users only — see guestGuard). */
export const AUTH_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    title: 'Sign in · e-Clinic',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'login/2fa',
    title: 'Verification · e-Clinic',
    loadComponent: () => import('./pages/two-factor/two-factor.page').then((m) => m.TwoFactorPage),
  },
  {
    path: 'password/forgot',
    title: 'Forgot password · e-Clinic',
    loadComponent: () =>
      import('./pages/password-reset/password-reset.page').then((m) => m.PasswordResetPage),
  },
  {
    path: 'password/reset/:token',
    title: 'New password · e-Clinic',
    loadComponent: () =>
      import('./pages/password-reset/password-reset.page').then((m) => m.PasswordResetPage),
  },
  // Link emailed by the server: /reset-password?token=…&email=…
  {
    path: 'reset-password',
    title: 'New password · e-Clinic',
    loadComponent: () =>
      import('./pages/password-reset/password-reset.page').then((m) => m.PasswordResetPage),
  },
];
