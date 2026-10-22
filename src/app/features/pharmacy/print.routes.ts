import { Routes } from '@angular/router';
import { accessGuard } from '@core/guards/auth.guards';

/** `/print` pharmacy documents: the prescription (A4, with its QR) and the medicine label (80 mm). */
export const PHARMACY_PRINT_ROUTES: Routes = [
  {
    path: 'prescription/:id',
    title: 'Prescription · e-Clinic',
    canMatch: [accessGuard('prescriptions.read_all | prescriptions.read_own')],
    loadComponent: () =>
      import('./pages/prescription-print/prescription-print.page').then(
        (m) => m.PrescriptionPrintPage,
      ),
  },
  {
    path: 'medicine-label/:id',
    title: 'Medicine label · e-Clinic',
    canMatch: [accessGuard('dispensing.read_all | dispensing.read_own')],
    loadComponent: () =>
      import('./pages/medicine-label-print/medicine-label-print.page').then(
        (m) => m.MedicineLabelPrintPage,
      ),
  },
];
