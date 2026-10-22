import { Routes } from '@angular/router';
import { accessGuard } from '@core/guards/auth.guards';

/** `/billing` — Payments & billing (lazy): cashier desk, invoices, payments, refunds, drawers and the price list. */
export const BILLING_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Billing · e-Clinic',
    loadComponent: () => import('@core/pages/hub/hub.page').then((m) => m.HubPage),
    data: { hub: '/billing' },
  },
  {
    path: 'cashier',
    title: 'Cashier desk · e-Clinic',
    canMatch: [accessGuard('cash_sessions.operate | payments.create')],
    loadComponent: () =>
      import('./pages/cashier-desk/cashier-desk.page').then((m) => m.CashierDeskPage),
  },
  {
    path: 'invoices',
    canMatch: [accessGuard('invoices.read_all | invoices.read_own')],
    children: [
      {
        path: '',
        title: 'Invoices · e-Clinic',
        loadComponent: () =>
          import('./pages/invoice-list/invoice-list.page').then((m) => m.InvoiceListPage),
      },
      {
        path: ':id',
        title: 'Invoice · e-Clinic',
        loadComponent: () =>
          import('./pages/invoice-detail/invoice-detail.page').then((m) => m.InvoiceDetailPage),
      },
    ],
  },
  {
    path: 'payments',
    title: 'Payments · e-Clinic',
    canMatch: [accessGuard('payments.read_all | payments.read_own')],
    loadComponent: () =>
      import('./pages/payment-list/payment-list.page').then((m) => m.PaymentListPage),
  },
  {
    path: 'refunds',
    title: 'Refunds · e-Clinic',
    canMatch: [accessGuard('refunds.read_all | refunds.read_own')],
    loadComponent: () =>
      import('./pages/refund-list/refund-list.page').then((m) => m.RefundListPage),
  },
  {
    path: 'insurance-claims',
    canMatch: [accessGuard('claims.read_all | claims.read_own')],
    children: [
      {
        path: '',
        title: 'Insurance claims · e-Clinic',
        loadComponent: () =>
          import('./pages/claim-list/claim-list.page').then((m) => m.ClaimListPage),
      },
      {
        path: ':id',
        title: 'Insurance claim · e-Clinic',
        loadComponent: () =>
          import('./pages/claim-detail/claim-detail.page').then((m) => m.ClaimDetailPage),
      },
    ],
  },
  {
    path: 'cash-drawers',
    canMatch: [accessGuard('cash_sessions.read_all | cash_sessions.read_own')],
    children: [
      {
        path: '',
        title: 'Cash drawers · e-Clinic',
        loadComponent: () =>
          import('./pages/cash-session-list/cash-session-list.page').then(
            (m) => m.CashSessionListPage,
          ),
      },
      {
        path: ':id',
        title: 'Cash drawer · e-Clinic',
        loadComponent: () =>
          import('./pages/cash-session-detail/cash-session-detail.page').then(
            (m) => m.CashSessionDetailPage,
          ),
      },
    ],
  },
  {
    path: 'service-catalog',
    canMatch: [accessGuard('services.read_all | services.read_own')],
    children: [
      {
        path: '',
        title: 'Service catalog · e-Clinic',
        loadComponent: () =>
          import('./pages/service-list/service-list.page').then((m) => m.ServiceListPage),
      },
      {
        path: ':id',
        title: 'Service · e-Clinic',
        loadComponent: () =>
          import('./pages/service-detail/service-detail.page').then((m) => m.ServiceDetailPage),
      },
    ],
  },
];
