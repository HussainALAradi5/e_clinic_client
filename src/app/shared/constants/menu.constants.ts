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
        route: '/dashboard',
        access: AUTHENTICATED,
        exact: true,
      },
    ],
  },
  {
    label: 'Identity & System',
    route: '/system',
    icon: 'shield_person',
    description: 'Accounts, people, access rights and the tools that keep the records traceable.',
    items: [
      {
        label: 'Users',
        description: 'Sign-in accounts, their status, roles and two-factor setup.',
        icon: 'manage_accounts',
        route: '/system/users',
        access: 'users.read_all | users.read_own',
      },
      {
        label: 'People',
        description: 'One record per patient or staff member; search before registering.',
        icon: 'person_search',
        route: '/system/people',
        access: 'people.read_all | people.read_own',
      },
      {
        label: 'Roles & permissions',
        description: 'What each role may see and do, edited in the access matrix.',
        icon: 'admin_panel_settings',
        route: '/system/roles-permissions',
        access: 'roles.read_all | roles.read_own',
      },
      {
        label: 'Audit logs',
        description: 'Who changed what and when, with CSV export.',
        icon: 'history',
        route: '/system/audit-logs',
        access: 'audit.read_all | audit.read_own',
      },
      {
        label: 'Attachments',
        description: 'Scanned and uploaded files linked to their records.',
        icon: 'attach_file',
        route: '/system/attachments',
        access: 'attachments.read_all | attachments.read_own',
      },
      {
        label: 'Notifications',
        description: 'Messages sent by email, SMS and in-app, with resend.',
        icon: 'outgoing_mail',
        route: '/system/notifications',
        access: 'notifications.read_all | notifications.read_own',
      },
      {
        label: 'Scan station',
        description: 'Scan a printed QR code to open its record.',
        icon: 'qr_code_scanner',
        route: '/system/scan',
        access: '(codes.read_all | codes.read_own) & codes.scan',
      },
      {
        label: 'Background tasks',
        description: 'Exports and imports running in the background.',
        icon: 'pending_actions',
        route: '/system/background-tasks',
        access: AUTHENTICATED,
      },
      {
        label: 'Saved views',
        description: 'Filters and columns saved for any list.',
        icon: 'bookmarks',
        route: '/system/list-views',
        access: AUTHENTICATED,
      },
    ],
  },
  {
    label: 'Reference data',
    route: '/reference',
    icon: 'dataset',
    description: 'Shared lists that the rest of the clinic picks from.',
    items: [
      {
        label: 'Companies',
        description: 'Insurers, suppliers, manufacturers, labs and hospitals.',
        icon: 'domain',
        route: '/reference/companies',
        access: 'companies.read_all | companies.read_own',
      },
      {
        label: 'Countries',
        description: 'Country list used for nationality, addresses and phone codes.',
        icon: 'public',
        route: '/reference/countries',
        access: AUTHENTICATED,
      },
    ],
  },
];
