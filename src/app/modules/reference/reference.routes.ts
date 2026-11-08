import { activityLogRoute } from '@utilities/activity-log';
import { Routes } from '@angular/router';
import { accessGuard } from '@middlewares/guards/auth.guards';
import { AUTHENTICATED } from '@constants/app.constants';

/** `/reference` — Reference Data (lazy): companies and countries. */
export const REFERENCE_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Reference data · e-Clinic',
    loadComponent: () => import('@pages/common/hub/hub.page').then((m) => m.HubPage),
    data: { hub: '/reference' },
  },
  {
    path: 'companies',
    canMatch: [accessGuard('companies.read_all | companies.read_own')],
    children: [
      {
        path: '',
        title: 'Companies · e-Clinic',
        loadComponent: () =>
          import('@pages/reference/company-list/company-list.page').then((m) => m.CompanyListPage),
      },
      {
        path: ':id',
        title: 'Company · e-Clinic',
        data: activityLogRoute('company', 'companies.read_all'),
        loadComponent: () =>
          import('@pages/reference/company-detail/company-detail.page').then(
            (m) => m.CompanyDetailPage,
          ),
      },
    ],
  },
  {
    path: 'countries',
    title: 'Countries · e-Clinic',
    canMatch: [accessGuard(AUTHENTICATED)],
    loadComponent: () =>
      import('@pages/reference/country-list/country-list.page').then((m) => m.CountryListPage),
  },
];
