import { Routes } from '@angular/router';
import { accessGuard } from '@core/guards/auth.guards';

/** `/print` HR documents: the payslip (A4). */
export const HR_PRINT_ROUTES: Routes = [
  {
    path: 'payslip/:id',
    title: 'Payslip · e-Clinic',
    canMatch: [accessGuard('payroll.read_all | payroll.read_own')],
    loadComponent: () =>
      import('./pages/payslip-print/payslip-print.page').then((m) => m.PayslipPrintPage),
  },
];
