import { Routes } from '@angular/router';
import { accessGuard } from '@middlewares/guards/auth.guards';

/** `/print` billing documents: invoice (A4), payment receipt and shift report (80 mm). */
export const BILLING_PRINT_ROUTES: Routes = [
  {
    path: 'invoice/:id',
    title: 'Invoice · e-Clinic',
    canMatch: [accessGuard('invoices.read_all | invoices.read_own')],
    loadComponent: () =>
      import('@pages/billing/invoice-print/invoice-print.page').then((m) => m.InvoicePrintPage),
  },
  {
    path: 'receipt/:id',
    title: 'Receipt · e-Clinic',
    canMatch: [accessGuard('payments.read_all | payments.read_own')],
    loadComponent: () =>
      import('@pages/billing/receipt-print/receipt-print.page').then((m) => m.ReceiptPrintPage),
  },
  {
    path: 'z-report/:id',
    title: 'Shift report · e-Clinic',
    canMatch: [accessGuard('cash_sessions.read_all | cash_sessions.read_own')],
    loadComponent: () =>
      import('@pages/billing/z-report-print/z-report-print.page').then((m) => m.ZReportPrintPage),
  },
  {
    path: 'claim/:id',
    title: 'Claim form · e-Clinic',
    canMatch: [accessGuard('claims.read_all')],
    loadComponent: () =>
      import('@pages/billing/claim-form-print/claim-form-print.page').then(
        (m) => m.ClaimFormPrintPage,
      ),
  },
];
