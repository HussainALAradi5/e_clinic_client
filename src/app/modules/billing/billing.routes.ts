import { activityLogRoute } from '@utilities/activity-log';
import { Routes } from '@angular/router';
import { accessGuard } from '@middlewares/guards/auth.guards';

/** `/billing` — Payments & billing (lazy): cashier desk, invoices, payments, refunds, drawers and the price list. */
export const BILLING_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Billing · e-Clinic',
    loadComponent: () => import('@pages/common/hub/hub.page').then((m) => m.HubPage),
    data: { hub: '/billing' },
  },
  {
    path: 'cashier',
    title: 'Cashier desk · e-Clinic',
    canMatch: [accessGuard('cash_sessions.operate | payments.create')],
    loadComponent: () =>
      import('@pages/billing/cashier-desk/cashier-desk.page').then((m) => m.CashierDeskPage),
  },
  {
    path: 'invoices',
    canMatch: [accessGuard('invoices.read_all | invoices.read_own')],
    children: [
      {
        path: '',
        title: 'Invoices · e-Clinic',
        loadComponent: () =>
          import('@pages/billing/invoice-list/invoice-list.page').then((m) => m.InvoiceListPage),
      },
      {
        path: ':id',
        title: 'Invoice · e-Clinic',
        data: activityLogRoute('invoice', 'invoices.read_all'),
        loadComponent: () =>
          import('@pages/billing/invoice-detail/invoice-detail.page').then(
            (m) => m.InvoiceDetailPage,
          ),
      },
    ],
  },
  {
    path: 'payments',
    title: 'Payments · e-Clinic',
    canMatch: [accessGuard('payments.read_all | payments.read_own')],
    loadComponent: () =>
      import('@pages/billing/payment-list/payment-list.page').then((m) => m.PaymentListPage),
  },
  {
    path: 'refunds',
    title: 'Refunds · e-Clinic',
    canMatch: [accessGuard('refunds.read_all | refunds.read_own')],
    loadComponent: () =>
      import('@pages/billing/refund-list/refund-list.page').then((m) => m.RefundListPage),
  },
  {
    path: 'packages',
    title: 'Packages · e-Clinic',
    canMatch: [accessGuard('packages.read_all')],
    loadComponent: () =>
      import('@pages/billing/package-list/package-list.page').then((m) => m.PackageListPage),
  },
  {
    path: 'fees',
    title: 'Visit fees · e-Clinic',
    canMatch: [accessGuard('appointment_fees.read_all | appointment_fees.read_own')],
    loadComponent: () => import('@pages/billing/fee-list/fee-list.page').then((m) => m.FeeListPage),
  },
  {
    path: 'insurance-claims',
    canMatch: [accessGuard('claims.read_all | claims.read_own')],
    children: [
      {
        path: '',
        title: 'Insurance claims · e-Clinic',
        loadComponent: () =>
          import('@pages/billing/claim-list/claim-list.page').then((m) => m.ClaimListPage),
      },
      {
        path: ':id',
        title: 'Insurance claim · e-Clinic',
        data: activityLogRoute('insurance_claim', 'claims.read_all'),
        loadComponent: () =>
          import('@pages/billing/claim-detail/claim-detail.page').then((m) => m.ClaimDetailPage),
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
          import('@pages/billing/cash-session-list/cash-session-list.page').then(
            (m) => m.CashSessionListPage,
          ),
      },
      {
        path: ':id',
        title: 'Cash drawer · e-Clinic',
        data: activityLogRoute('cash_session', 'cash_sessions.read_all'),
        loadComponent: () =>
          import('@pages/billing/cash-session-detail/cash-session-detail.page').then(
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
          import('@pages/billing/service-list/service-list.page').then((m) => m.ServiceListPage),
      },
      {
        path: ':id',
        title: 'Service · e-Clinic',
        data: activityLogRoute('billable_service', 'services.read_all'),
        loadComponent: () =>
          import('@pages/billing/service-detail/service-detail.page').then(
            (m) => m.ServiceDetailPage,
          ),
      },
    ],
  },
];
