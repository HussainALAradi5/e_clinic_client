import { Routes } from '@angular/router';
import { accessGuard } from '@core/guards/auth.guards';

const READ = 'accounts.read_all | accounts.read_own';

/** `/accounting` — Accounting (lazy): reports, journal, expenses, fiscal years and the chart of accounts. */
export const ACCOUNTING_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Accounting · e-Clinic',
    loadComponent: () => import('@core/pages/hub/hub.page').then((m) => m.HubPage),
    data: { hub: '/accounting' },
  },
  {
    path: 'reports',
    title: 'Financial reports · e-Clinic',
    canMatch: [accessGuard('reports.read_all | reports.read_own')],
    loadComponent: () =>
      import('./pages/financial-reports/financial-reports.page').then(
        (m) => m.FinancialReportsPage,
      ),
  },
  {
    path: 'journal',
    canMatch: [accessGuard('journal.read_all | journal.read_own')],
    children: [
      {
        path: '',
        title: 'Journal · e-Clinic',
        loadComponent: () =>
          import('./pages/journal-list/journal-list.page').then((m) => m.JournalListPage),
      },
      {
        path: ':id',
        title: 'Journal entry · e-Clinic',
        loadComponent: () =>
          import('./pages/journal-detail/journal-detail.page').then((m) => m.JournalDetailPage),
      },
    ],
  },
  {
    path: 'expenses',
    canMatch: [accessGuard('expenses.read_all | expenses.read_own')],
    children: [
      {
        path: '',
        title: 'Expenses · e-Clinic',
        loadComponent: () =>
          import('./pages/expense-list/expense-list.page').then((m) => m.ExpenseListPage),
      },
      {
        path: ':id',
        title: 'Expense · e-Clinic',
        loadComponent: () =>
          import('./pages/expense-detail/expense-detail.page').then((m) => m.ExpenseDetailPage),
      },
    ],
  },
  {
    path: 'fiscal-years',
    title: 'Fiscal years · e-Clinic',
    canMatch: [accessGuard('fiscal.read_all | fiscal.read_own')],
    loadComponent: () =>
      import('./pages/fiscal-years/fiscal-years.page').then((m) => m.FiscalYearsPage),
  },
  {
    path: 'chart-of-accounts',
    canMatch: [accessGuard(READ)],
    children: [
      {
        path: '',
        title: 'Chart of accounts · e-Clinic',
        loadComponent: () =>
          import('./pages/account-list/account-list.page').then((m) => m.AccountListPage),
      },
      {
        path: 'tree',
        title: 'Account tree · e-Clinic',
        loadComponent: () =>
          import('./pages/account-tree/account-tree.page').then((m) => m.AccountTreePage),
      },
      {
        path: 'mappings',
        title: 'Posting accounts · e-Clinic',
        loadComponent: () =>
          import('./pages/account-mappings/account-mappings.page').then(
            (m) => m.AccountMappingsPage,
          ),
      },
      {
        path: ':id',
        title: 'Account · e-Clinic',
        loadComponent: () =>
          import('./pages/account-detail/account-detail.page').then((m) => m.AccountDetailPage),
      },
    ],
  },
];
