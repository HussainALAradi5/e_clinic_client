import { Routes } from '@angular/router';
import { accessGuard } from '@core/guards/auth.guards';

/** `/print` — documents without the app chrome (opened in a new tab and printed). */
export const PRINT_ROUTES: Routes = [
  {
    path: 'referral/:id',
    title: 'Referral letter · e-Clinic',
    canMatch: [accessGuard('orders.read_all | orders.read_own')],
    loadComponent: () =>
      import('./pages/referral-letter/referral-letter.page').then((m) => m.ReferralLetterPage),
  },
  {
    path: 'consent/:id',
    title: 'Consent form · e-Clinic',
    canMatch: [accessGuard('consents.read_all | consents.read_own')],
    loadComponent: () =>
      import('./pages/consent-form/consent-form.page').then((m) => m.ConsentFormPage),
  },
];
