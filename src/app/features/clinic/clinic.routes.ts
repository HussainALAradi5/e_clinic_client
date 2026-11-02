import { Routes } from '@angular/router';
import { accessGuard } from '@core/guards/auth.guards';
import { AUTHENTICATED } from '@shared/constants/app.constants';

const APPOINTMENTS = 'appointments.read_all | appointments.read_own';

/** `/clinic` — Front desk & clinic (lazy): patients, doctors, rooms, schedules, appointments, visits, treatments and orders. */
export const CLINIC_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Front desk & clinic · e-Clinic',
    loadComponent: () => import('@core/pages/hub/hub.page').then((m) => m.HubPage),
    data: { hub: '/clinic' },
  },
  {
    path: 'front-desk',
    title: 'Front desk · e-Clinic',
    canMatch: [accessGuard('appointments.write & appointments.check_in')],
    loadComponent: () => import('./pages/front-desk/front-desk.page').then((m) => m.FrontDeskPage),
  },
  {
    path: 'calendar',
    title: 'Calendar · e-Clinic',
    canMatch: [accessGuard(APPOINTMENTS)],
    loadComponent: () => import('./pages/calendar/calendar.page').then((m) => m.CalendarPage),
  },
  {
    path: 'appointments',
    canMatch: [accessGuard(APPOINTMENTS)],
    children: [
      {
        path: '',
        title: 'Appointments · e-Clinic',
        loadComponent: () =>
          import('./pages/appointment-list/appointment-list.page').then(
            (m) => m.AppointmentListPage,
          ),
      },
      {
        path: ':id',
        title: 'Appointment · e-Clinic',
        loadComponent: () =>
          import('./pages/appointment-detail/appointment-detail.page').then(
            (m) => m.AppointmentDetailPage,
          ),
      },
      {
        path: ':id/visit',
        title: 'Visit · e-Clinic',
        canMatch: [accessGuard('records.read_all | records.read_own')],
        loadComponent: () =>
          import('./pages/visit-workspace/visit-workspace.page').then((m) => m.VisitWorkspacePage),
      },
    ],
  },
  {
    path: 'sick-leaves',
    title: 'Sick leaves · e-Clinic',
    canMatch: [accessGuard('sick_leaves.read_all | sick_leaves.read_own')],
    loadComponent: () =>
      import('./pages/sick-leave-list/sick-leave-list.page').then((m) => m.SickLeaveListPage),
  },
  {
    path: 'treatments',
    canMatch: [accessGuard('treatments.read_all | treatments.read_own')],
    children: [
      {
        path: '',
        title: 'Treatments · e-Clinic',
        loadComponent: () =>
          import('./pages/treatment-list/treatment-list.page').then((m) => m.TreatmentListPage),
      },
      {
        path: 'queue',
        title: 'Scheduling queue · e-Clinic',
        loadComponent: () =>
          import('./pages/treatment-queue/treatment-queue.page').then((m) => m.TreatmentQueuePage),
      },
      {
        path: ':id',
        title: 'Treatment · e-Clinic',
        loadComponent: () =>
          import('./pages/treatment-detail/treatment-detail.page').then(
            (m) => m.TreatmentDetailPage,
          ),
      },
    ],
  },
  {
    path: 'clinical-orders',
    canMatch: [accessGuard('orders.read_all | orders.read_own')],
    children: [
      {
        path: '',
        title: 'Clinical orders · e-Clinic',
        loadComponent: () =>
          import('./pages/order-list/order-list.page').then((m) => m.OrderListPage),
      },
      {
        path: 'worklist',
        title: 'Orders work list · e-Clinic',
        loadComponent: () =>
          import('./pages/order-worklist/order-worklist.page').then((m) => m.OrderWorklistPage),
      },
      {
        path: ':id',
        title: 'Clinical order · e-Clinic',
        loadComponent: () =>
          import('./pages/order-detail/order-detail.page').then((m) => m.OrderDetailPage),
      },
    ],
  },
  {
    path: 'patients',
    canMatch: [accessGuard('patients.read_all | patients.read_own')],
    children: [
      {
        path: '',
        title: 'Patients · e-Clinic',
        loadComponent: () =>
          import('./pages/patient-list/patient-list.page').then((m) => m.PatientListPage),
      },
      {
        path: ':id',
        title: 'Patient · e-Clinic',
        loadComponent: () =>
          import('./pages/patient-detail/patient-detail.page').then((m) => m.PatientDetailPage),
      },
    ],
  },
  {
    path: 'doctors',
    canMatch: [accessGuard('doctors.read_all | doctors.read_own')],
    children: [
      {
        path: '',
        title: 'Doctors · e-Clinic',
        loadComponent: () =>
          import('./pages/doctor-list/doctor-list.page').then((m) => m.DoctorListPage),
      },
      {
        path: ':id',
        title: 'Doctor · e-Clinic',
        loadComponent: () =>
          import('./pages/doctor-detail/doctor-detail.page').then((m) => m.DoctorDetailPage),
      },
    ],
  },
  {
    path: 'providers/:providerId/schedule',
    title: 'Weekly schedule · e-Clinic',
    canMatch: [accessGuard('schedules.read_all | schedules.read_own')],
    loadComponent: () =>
      import('./pages/schedule-editor/schedule-editor.page').then((m) => m.ScheduleEditorPage),
  },
  {
    path: 'specialties',
    title: 'Specialties · e-Clinic',
    canMatch: [accessGuard(AUTHENTICATED)],
    loadComponent: () =>
      import('./pages/specialty-list/specialty-list.page').then((m) => m.SpecialtyListPage),
  },
  {
    path: 'rooms',
    canMatch: [accessGuard('rooms.read_all | rooms.read_own')],
    children: [
      {
        path: '',
        title: 'Rooms · e-Clinic',
        loadComponent: () => import('./pages/room-list/room-list.page').then((m) => m.RoomListPage),
      },
      {
        path: ':id',
        title: 'Room · e-Clinic',
        loadComponent: () =>
          import('./pages/room-detail/room-detail.page').then((m) => m.RoomDetailPage),
      },
    ],
  },
  {
    path: 'holidays',
    title: 'Clinic holidays · e-Clinic',
    canMatch: [accessGuard('schedules.read_all')],
    loadComponent: () => import('./pages/holidays/holidays.page').then((m) => m.HolidaysPage),
  },
];
