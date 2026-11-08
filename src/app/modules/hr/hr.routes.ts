import { Routes } from '@angular/router';
import { accessGuard } from '@middlewares/guards/auth.guards';

/** `/hr` — Human resources (lazy): my HR, attendance, leave, payroll, departments, shifts and employees. */
export const HR_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Human resources · e-Clinic',
    loadComponent: () => import('@pages/common/hub/hub.page').then((m) => m.HubPage),
    data: { hub: '/hr' },
  },
  {
    path: 'dashboard',
    title: 'Attendance dashboard · e-Clinic',
    canMatch: [accessGuard('dashboards.read_all & attendance.read_all')],
    loadComponent: () =>
      import('@pages/hr/attendance-dashboard/attendance-dashboard.page').then(
        (m) => m.AttendanceDashboardPage,
      ),
  },
  {
    path: 'departments',
    canMatch: [accessGuard('departments.read_all | departments.read_own')],
    children: [
      {
        path: '',
        title: 'Departments · e-Clinic',
        loadComponent: () =>
          import('@pages/hr/department-list/department-list.page').then(
            (m) => m.DepartmentListPage,
          ),
      },
      {
        path: ':id',
        title: 'Department · e-Clinic',
        loadComponent: () =>
          import('@pages/hr/department-detail/department-detail.page').then(
            (m) => m.DepartmentDetailPage,
          ),
      },
    ],
  },
  {
    path: 'shifts',
    title: 'Shifts · e-Clinic',
    canMatch: [accessGuard('shifts.read_all')],
    loadComponent: () =>
      import('@pages/hr/shift-board/shift-board.page').then((m) => m.ShiftBoardPage),
  },
  {
    path: 'employees',
    canMatch: [accessGuard('employees.read_all | employees.read_own')],
    children: [
      {
        path: '',
        title: 'Employees · e-Clinic',
        loadComponent: () =>
          import('@pages/hr/employee-list/employee-list.page').then((m) => m.EmployeeListPage),
      },
      {
        path: ':id',
        title: 'Employee · e-Clinic',
        loadComponent: () =>
          import('@pages/hr/employee-detail/employee-detail.page').then(
            (m) => m.EmployeeDetailPage,
          ),
      },
    ],
  },
  {
    path: 'me',
    title: 'My HR · e-Clinic',
    canMatch: [accessGuard('attendance.self | leaves.request')],
    loadComponent: () => import('@pages/hr/my-hr/my-hr.page').then((m) => m.MyHrPage),
  },
  {
    path: 'requests',
    title: 'Requests · e-Clinic',
    canMatch: [accessGuard('staff_requests.read_all | staff_requests.read_own')],
    loadComponent: () =>
      import('@pages/hr/staff-requests/staff-requests.page').then((m) => m.StaffRequestsPage),
  },
  {
    path: 'settings',
    title: 'HR settings · e-Clinic',
    canMatch: [accessGuard('settings.read_all')],
    loadComponent: () =>
      import('@pages/hr/hr-settings/hr-settings.page').then((m) => m.HrSettingsPage),
  },
  {
    path: 'attendance',
    title: 'Attendance · e-Clinic',
    canMatch: [accessGuard('attendance.read_all')],
    loadComponent: () =>
      import('@pages/hr/attendance-list/attendance-list.page').then((m) => m.AttendanceListPage),
  },
  {
    path: 'leaves',
    canMatch: [accessGuard('leaves.read_all | leaves.read_own')],
    children: [
      {
        path: '',
        title: 'Leave · e-Clinic',
        loadComponent: () =>
          import('@pages/hr/leave-list/leave-list.page').then((m) => m.LeaveListPage),
      },
      {
        path: ':id',
        title: 'Leave request · e-Clinic',
        loadComponent: () =>
          import('@pages/hr/leave-detail/leave-detail.page').then((m) => m.LeaveDetailPage),
      },
    ],
  },
  {
    path: 'leave-types',
    title: 'Leave types · e-Clinic',
    canMatch: [accessGuard('leaves.manage_types')],
    loadComponent: () =>
      import('@pages/hr/leave-types/leave-types.page').then((m) => m.LeaveTypesPage),
  },
  {
    path: 'doctor-earnings',
    title: 'Doctor earnings · e-Clinic',
    canMatch: [accessGuard('payroll.read_all')],
    loadComponent: () =>
      import('@pages/hr/doctor-earnings/doctor-earnings.page').then((m) => m.DoctorEarningsPage),
  },
  {
    path: 'payroll',
    canMatch: [accessGuard('payroll.read_all')],
    children: [
      {
        path: '',
        title: 'Payroll · e-Clinic',
        loadComponent: () =>
          import('@pages/hr/payroll-list/payroll-list.page').then((m) => m.PayrollListPage),
      },
      {
        path: ':id',
        title: 'Payroll · e-Clinic',
        loadComponent: () =>
          import('@pages/hr/payroll-detail/payroll-detail.page').then((m) => m.PayrollDetailPage),
      },
    ],
  },
];
