import { Routes } from '@angular/router';

/** Public website pages (no sign-in), rendered inside PublicLayout. */
export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'e-Clinic · Seef, Bahrain',
    loadComponent: () => import('@pages/public/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'verify',
    title: 'Verify a document · e-Clinic',
    loadComponent: () => import('@pages/public/verify/verify.page').then((m) => m.VerifyPage),
  },
];
