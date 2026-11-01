import { Routes } from '@angular/router';
import { accessGuard } from '@core/guards/auth.guards';

/** `/hr` — Human resources (lazy): my HR, attendance, leave, payroll, departments, shifts and employees. */
export const HR_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Human resources · e-Clinic',
    loadComponent: () => import('@core/pages/hub/hub.page').then((m) => m.HubPage),
    data: { hub: '/hr' },
  },
  {
    path: 'departments',
    canMatch: [accessGuard('departments.read_all | departments.read_own')],
    children: [
      {
        path: '',
        title: 'Departments · e-Clinic',
        loadComponent: () =>
          import('./pages/department-list/department-list.page').then((m) => m.DepartmentListPage),
      },
      {
        path: ':id',
        title: 'Department · e-Clinic',
        loadComponent: () =>
          import('./pages/department-detail/department-detail.page').then(
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
      import('./pages/shift-board/shift-board.page').then((m) => m.ShiftBoardPage),
  },
  {
    path: 'employees',
    canMatch: [accessGuard('employees.read_all | employees.read_own')],
    children: [
      {
        path: '',
        title: 'Employees · e-Clinic',
        loadComponent: () =>
          import('./pages/employee-list/employee-list.page').then((m) => m.EmployeeListPage),
      },
      {
        path: ':id',
        title: 'Employee · e-Clinic',
        loadComponent: () =>
          import('./pages/employee-detail/employee-detail.page').then((m) => m.EmployeeDetailPage),
      },
    ],
  },
  {
    path: 'me',
    title: 'My HR · e-Clinic',
    canMatch: [accessGuard('attendance.self | leaves.request')],
    loadComponent: () => import('./pages/my-hr/my-hr.page').then((m) => m.MyHrPage),
  },
  {
    path: 'attendance',
    title: 'Attendance · e-Clinic',
    canMatch: [accessGuard('attendance.read_all')],
    loadComponent: () =>
      import('./pages/attendance-list/attendance-list.page').then((m) => m.AttendanceListPage),
  },
  {
    path: 'leaves',
    canMatch: [accessGuard('leaves.read_all | leaves.read_own')],
    children: [
      {
        path: '',
        title: 'Leave · e-Clinic',
        loadComponent: () =>
          import('./pages/leave-list/leave-list.page').then((m) => m.LeaveListPage),
      },
      {
        path: ':id',
        title: 'Leave request · e-Clinic',
        loadComponent: () =>
          import('./pages/leave-detail/leave-detail.page').then((m) => m.LeaveDetailPage),
      },
    ],
  },
  {
    path: 'leave-types',
    title: 'Leave types · e-Clinic',
    canMatch: [accessGuard('leaves.manage_types')],
    loadComponent: () =>
      import('./pages/leave-types/leave-types.page').then((m) => m.LeaveTypesPage),
  },
  {
    path: 'payroll',
    canMatch: [accessGuard('payroll.read_all')],
    children: [
      {
        path: '',
        title: 'Payroll · e-Clinic',
        loadComponent: () =>
          import('./pages/payroll-list/payroll-list.page').then((m) => m.PayrollListPage),
      },
      {
        path: ':id',
        title: 'Payroll · e-Clinic',
        loadComponent: () =>
          import('./pages/payroll-detail/payroll-detail.page').then((m) => m.PayrollDetailPage),
      },
    ],
  },
];
