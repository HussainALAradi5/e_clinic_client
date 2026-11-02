import { Routes } from '@angular/router';
import { accessGuard } from '@middlewares/guards/auth.guards';

const MEDICATIONS = 'medications.read_all | medications.read_own';
const INVENTORY = 'inventory.read_all | inventory.read_own';

/** `/pharmacy` — Pharmacy (lazy): dispensing station, prescriptions, dispensing log, catalogue and stock. */
export const PHARMACY_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Pharmacy · e-Clinic',
    loadComponent: () => import('@pages/common/hub/hub.page').then((m) => m.HubPage),
    data: { hub: '/pharmacy' },
  },
  {
    path: 'dispense',
    title: 'Dispense · e-Clinic',
    canMatch: [accessGuard('dispensing.create & dispensing.dispense')],
    loadComponent: () =>
      import('@pages/pharmacy/dispense/dispense.page').then((m) => m.DispensePage),
  },
  {
    path: 'prescriptions',
    canMatch: [accessGuard('prescriptions.read_all | prescriptions.read_own')],
    children: [
      {
        path: '',
        title: 'Prescriptions · e-Clinic',
        loadComponent: () =>
          import('@pages/pharmacy/prescription-list/prescription-list.page').then(
            (m) => m.PrescriptionListPage,
          ),
      },
      {
        path: ':id',
        title: 'Prescription · e-Clinic',
        loadComponent: () =>
          import('@pages/pharmacy/prescription-detail/prescription-detail.page').then(
            (m) => m.PrescriptionDetailPage,
          ),
      },
    ],
  },
  {
    path: 'dispensations',
    canMatch: [accessGuard('dispensing.read_all | dispensing.read_own')],
    children: [
      {
        path: '',
        title: 'Dispensing log · e-Clinic',
        loadComponent: () =>
          import('@pages/pharmacy/dispensation-list/dispensation-list.page').then(
            (m) => m.DispensationListPage,
          ),
      },
      {
        path: ':id',
        title: 'Dispensation · e-Clinic',
        loadComponent: () =>
          import('@pages/pharmacy/dispensation-detail/dispensation-detail.page').then(
            (m) => m.DispensationDetailPage,
          ),
      },
    ],
  },
  {
    path: 'medications',
    canMatch: [accessGuard(MEDICATIONS)],
    children: [
      {
        path: '',
        title: 'Medications · e-Clinic',
        loadComponent: () =>
          import('@pages/pharmacy/medication-list/medication-list.page').then(
            (m) => m.MedicationListPage,
          ),
      },
      {
        path: ':id',
        title: 'Medication · e-Clinic',
        loadComponent: () =>
          import('@pages/pharmacy/medication-detail/medication-detail.page').then(
            (m) => m.MedicationDetailPage,
          ),
      },
    ],
  },
  {
    path: 'low-stock',
    title: 'Low stock · e-Clinic',
    canMatch: [accessGuard(MEDICATIONS)],
    loadComponent: () =>
      import('@pages/pharmacy/low-stock/low-stock.page').then((m) => m.LowStockPage),
  },
  {
    path: 'stock',
    title: 'Stock by lot · e-Clinic',
    canMatch: [accessGuard(INVENTORY)],
    loadComponent: () => import('@pages/pharmacy/stock/stock.page').then((m) => m.StockPage),
  },
  {
    path: 'movements',
    title: 'Stock movements · e-Clinic',
    canMatch: [accessGuard(INVENTORY)],
    loadComponent: () =>
      import('@pages/pharmacy/movements/movements.page').then((m) => m.MovementsPage),
  },
];
