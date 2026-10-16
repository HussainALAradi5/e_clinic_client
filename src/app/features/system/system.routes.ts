import { Routes } from '@angular/router';
import { accessGuard } from '@core/guards/auth.guards';
import { AUTHENTICATED } from '@shared/constants/app.constants';
import { unsavedChangesGuard } from '@core/guards/unsaved-changes.guard';

/** `/system` — Identity & System (lazy). Each page is guarded by the same expression as its API endpoint. */
export const SYSTEM_ROUTES: Routes = [
  {
    path: 'users',
    canMatch: [accessGuard('users.read_all | users.read_own')],
    children: [
      {
        path: '',
        title: 'Users · e-Clinic',
        loadComponent: () =>
          import('./users/pages/user-list/user-list.page').then((m) => m.UserListPage),
      },
      {
        path: ':id',
        title: 'User · e-Clinic',
        loadComponent: () =>
          import('./users/pages/user-detail/user-detail.page').then((m) => m.UserDetailPage),
      },
    ],
  },
  {
    path: 'people',
    title: 'People · e-Clinic',
    canMatch: [accessGuard('people.read_all | people.read_own')],
    loadComponent: () =>
      import('./users/pages/people-search/people-search.page').then((m) => m.PeopleSearchPage),
  },
  {
    path: 'roles-permissions',
    canMatch: [accessGuard('roles.read_all | roles.read_own')],
    children: [
      {
        path: '',
        title: 'Roles & permissions · e-Clinic',
        loadComponent: () =>
          import('./roles/pages/role-list/role-list.page').then((m) => m.RoleListPage),
      },
      {
        path: ':id',
        title: 'Role · e-Clinic',
        loadComponent: () =>
          import('./roles/pages/role-detail/role-detail.page').then((m) => m.RoleDetailPage),
      },
      {
        path: ':id/access',
        title: 'Access matrix · e-Clinic',
        canMatch: [accessGuard('roles.write')],
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
          import('./roles/pages/access-matrix/access-matrix.page').then((m) => m.AccessMatrixPage),
      },
    ],
  },
  {
    path: 'audit-logs',
    title: 'Audit logs · e-Clinic',
    canMatch: [accessGuard('audit.read_all | audit.read_own')],
    loadComponent: () =>
      import('./audit-logs/pages/audit-log-list/audit-log-list.page').then(
        (m) => m.AuditLogListPage,
      ),
  },
  {
    path: 'background-tasks',
    canMatch: [accessGuard(AUTHENTICATED)],
    children: [
      {
        path: '',
        title: 'Background tasks · e-Clinic',
        loadComponent: () =>
          import('./background-tasks/pages/task-list/task-list.page').then((m) => m.TaskListPage),
      },
      {
        path: ':id',
        title: 'Background task · e-Clinic',
        loadComponent: () =>
          import('./background-tasks/pages/task-detail/task-detail.page').then(
            (m) => m.TaskDetailPage,
          ),
      },
    ],
  },
  {
    path: 'attachments',
    title: 'Attachments · e-Clinic',
    canMatch: [accessGuard('attachments.read_all | attachments.read_own')],
    loadComponent: () =>
      import('./attachments/pages/attachment-list/attachment-list.page').then(
        (m) => m.AttachmentListPage,
      ),
  },
  {
    path: 'scan',
    title: 'Scan station · e-Clinic',
    canMatch: [accessGuard('(codes.read_all | codes.read_own) & codes.scan')],
    loadComponent: () =>
      import('./scan/pages/scan-station/scan-station.page').then((m) => m.ScanStationPage),
  },
  {
    path: 'notifications',
    title: 'Notifications · e-Clinic',
    canMatch: [accessGuard('notifications.read_all | notifications.read_own')],
    loadComponent: () =>
      import('./notifications/pages/notification-list/notification-list.page').then(
        (m) => m.NotificationListPage,
      ),
  },
  {
    path: 'list-views',
    title: 'Saved views · e-Clinic',
    canMatch: [accessGuard(AUTHENTICATED)],
    loadComponent: () =>
      import('./list-views/pages/view-list/view-list.page').then((m) => m.ViewListPage),
  },
];
