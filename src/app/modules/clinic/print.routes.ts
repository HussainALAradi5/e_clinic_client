import { Routes } from '@angular/router';
import { accessGuard } from '@middlewares/guards/auth.guards';

/** `/print` — documents without the app chrome (opened in a new tab and printed). */
export const PRINT_ROUTES: Routes = [
  {
    path: 'referral/:id',
    title: 'Referral letter · e-Clinic',
    canMatch: [accessGuard('orders.read_all | orders.read_own')],
    loadComponent: () =>
      import('@pages/clinic/referral-letter/referral-letter.page').then(
        (m) => m.ReferralLetterPage,
      ),
  },
  {
    path: 'sick-leave/:id',
    title: 'Sick leave · e-Clinic',
    canMatch: [accessGuard('sick_leaves.read_all | sick_leaves.read_own')],
    loadComponent: () =>
      import('@pages/clinic/sick-leave-print/sick-leave-print.page').then(
        (m) => m.SickLeavePrintPage,
      ),
  },
  {
    path: 'result/:id',
    title: 'Result report · e-Clinic',
    canMatch: [accessGuard('orders.read_all | orders.read_own')],
    loadComponent: () =>
      import('@pages/clinic/result-print/result-print.page').then((m) => m.ResultPrintPage),
  },
  {
    path: 'consent/:id',
    title: 'Consent form · e-Clinic',
    canMatch: [accessGuard('consents.read_all | consents.read_own')],
    loadComponent: () =>
      import('@pages/clinic/consent-form/consent-form.page').then((m) => m.ConsentFormPage),
  },
];
