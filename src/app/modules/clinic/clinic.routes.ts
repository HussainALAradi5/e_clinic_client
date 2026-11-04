import { Routes } from '@angular/router';
import { accessGuard } from '@middlewares/guards/auth.guards';
import { AUTHENTICATED } from '@constants/app.constants';

const APPOINTMENTS = 'appointments.read_all | appointments.read_own';

/** `/clinic` — Front desk & clinic (lazy): patients, doctors, rooms, schedules, appointments, visits, treatments and orders. */
export const CLINIC_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Front desk & clinic · e-Clinic',
    loadComponent: () => import('@pages/common/hub/hub.page').then((m) => m.HubPage),
    data: { hub: '/clinic' },
  },
  {
    path: 'front-desk',
    title: 'Front desk · e-Clinic',
    canMatch: [accessGuard('appointments.write & appointments.check_in')],
    loadComponent: () =>
      import('@pages/clinic/front-desk/front-desk.page').then((m) => m.FrontDeskPage),
  },
  {
    path: 'calendar',
    title: 'Calendar · e-Clinic',
    canMatch: [accessGuard(APPOINTMENTS)],
    loadComponent: () => import('@pages/clinic/calendar/calendar.page').then((m) => m.CalendarPage),
  },
  {
    path: 'appointments',
    canMatch: [accessGuard(APPOINTMENTS)],
    children: [
      {
        path: '',
        title: 'Appointments · e-Clinic',
        loadComponent: () =>
          import('@pages/clinic/appointment-list/appointment-list.page').then(
            (m) => m.AppointmentListPage,
          ),
      },
      {
        path: ':id',
        title: 'Appointment · e-Clinic',
        loadComponent: () =>
          import('@pages/clinic/appointment-detail/appointment-detail.page').then(
            (m) => m.AppointmentDetailPage,
          ),
      },
      {
        path: ':id/visit',
        title: 'Visit · e-Clinic',
        canMatch: [accessGuard('records.read_all | records.read_own')],
        loadComponent: () =>
          import('@pages/clinic/visit-workspace/visit-workspace.page').then(
            (m) => m.VisitWorkspacePage,
          ),
      },
    ],
  },
  {
    path: 'sick-leaves',
    title: 'Sick leaves · e-Clinic',
    canMatch: [accessGuard('sick_leaves.read_all | sick_leaves.read_own')],
    loadComponent: () =>
      import('@pages/clinic/sick-leave-list/sick-leave-list.page').then((m) => m.SickLeaveListPage),
  },
  {
    path: 'document-templates',
    title: 'Document templates · e-Clinic',
    canMatch: [accessGuard('templates.read_all | templates.read_own')],
    loadComponent: () =>
      import('@pages/clinic/document-templates/document-templates.page').then(
        (m) => m.DocumentTemplatesPage,
      ),
  },
  {
    path: 'treatments',
    canMatch: [accessGuard('treatments.read_all | treatments.read_own')],
    children: [
      {
        path: '',
        title: 'Treatments · e-Clinic',
        loadComponent: () =>
          import('@pages/clinic/treatment-list/treatment-list.page').then(
            (m) => m.TreatmentListPage,
          ),
      },
      {
        path: 'queue',
        title: 'Scheduling queue · e-Clinic',
        loadComponent: () =>
          import('@pages/clinic/treatment-queue/treatment-queue.page').then(
            (m) => m.TreatmentQueuePage,
          ),
      },
      {
        path: ':id',
        title: 'Treatment · e-Clinic',
        loadComponent: () =>
          import('@pages/clinic/treatment-detail/treatment-detail.page').then(
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
          import('@pages/clinic/order-list/order-list.page').then((m) => m.OrderListPage),
      },
      {
        path: 'worklist',
        title: 'Orders work list · e-Clinic',
        loadComponent: () =>
          import('@pages/clinic/order-worklist/order-worklist.page').then(
            (m) => m.OrderWorklistPage,
          ),
      },
      {
        path: ':id',
        title: 'Clinical order · e-Clinic',
        loadComponent: () =>
          import('@pages/clinic/order-detail/order-detail.page').then((m) => m.OrderDetailPage),
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
          import('@pages/clinic/patient-list/patient-list.page').then((m) => m.PatientListPage),
      },
      {
        path: ':id',
        title: 'Patient · e-Clinic',
        loadComponent: () =>
          import('@pages/clinic/patient-detail/patient-detail.page').then(
            (m) => m.PatientDetailPage,
          ),
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
          import('@pages/clinic/doctor-list/doctor-list.page').then((m) => m.DoctorListPage),
      },
      {
        path: ':id',
        title: 'Doctor · e-Clinic',
        loadComponent: () =>
          import('@pages/clinic/doctor-detail/doctor-detail.page').then((m) => m.DoctorDetailPage),
      },
    ],
  },
  {
    path: 'providers/:providerId/schedule',
    title: 'Weekly schedule · e-Clinic',
    canMatch: [accessGuard('schedules.read_all | schedules.read_own')],
    loadComponent: () =>
      import('@pages/clinic/schedule-editor/schedule-editor.page').then(
        (m) => m.ScheduleEditorPage,
      ),
  },
  {
    path: 'specialties',
    title: 'Specialties · e-Clinic',
    canMatch: [accessGuard(AUTHENTICATED)],
    loadComponent: () =>
      import('@pages/clinic/specialty-list/specialty-list.page').then((m) => m.SpecialtyListPage),
  },
  {
    path: 'rooms',
    canMatch: [accessGuard('rooms.read_all | rooms.read_own')],
    children: [
      {
        path: '',
        title: 'Rooms · e-Clinic',
        loadComponent: () =>
          import('@pages/clinic/room-list/room-list.page').then((m) => m.RoomListPage),
      },
      {
        path: ':id',
        title: 'Room · e-Clinic',
        loadComponent: () =>
          import('@pages/clinic/room-detail/room-detail.page').then((m) => m.RoomDetailPage),
      },
    ],
  },
  {
    path: 'holidays',
    title: 'Clinic holidays · e-Clinic',
    canMatch: [accessGuard('schedules.read_all')],
    loadComponent: () => import('@pages/clinic/holidays/holidays.page').then((m) => m.HolidaysPage),
  },
];
