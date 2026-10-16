import { AUTHENTICATED } from './app.constants';
import { NavGroup } from '@shared/interfaces/ui/nav.interface';

/**
 * Side menu (navigation doc). Items are filtered by AccessService with the same expressions as the route guards,
 * so the menu always matches the server's access matrix. Each module appends its group when it is implemented.
 */
export const MENU: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        icon: 'space_dashboard',
        route: '/',
        access: AUTHENTICATED,
        exact: true,
      },
    ],
  },
  {
    label: 'Identity & System',
    items: [
      {
        label: 'Users',
        icon: 'manage_accounts',
        route: '/system/users',
        access: 'users.read_all | users.read_own',
      },
      {
        label: 'People',
        icon: 'person_search',
        route: '/system/people',
        access: 'people.read_all | people.read_own',
      },
      {
        label: 'Roles & permissions',
        icon: 'admin_panel_settings',
        route: '/system/roles-permissions',
        access: 'roles.read_all | roles.read_own',
      },
      {
        label: 'Audit logs',
        icon: 'history',
        route: '/system/audit-logs',
        access: 'audit.read_all | audit.read_own',
      },
      {
        label: 'Attachments',
        icon: 'attach_file',
        route: '/system/attachments',
        access: 'attachments.read_all | attachments.read_own',
      },
      {
        label: 'Notifications',
        icon: 'outgoing_mail',
        route: '/system/notifications',
        access: 'notifications.read_all | notifications.read_own',
      },
      {
        label: 'Scan station',
        icon: 'qr_code_scanner',
        route: '/system/scan',
        access: '(codes.read_all | codes.read_own) & codes.scan',
      },
      {
        label: 'Background tasks',
        icon: 'pending_actions',
        route: '/system/background-tasks',
        access: AUTHENTICATED,
      },
      {
        label: 'Saved views',
        icon: 'bookmarks',
        route: '/system/list-views',
        access: AUTHENTICATED,
      },
    ],
  },
];
