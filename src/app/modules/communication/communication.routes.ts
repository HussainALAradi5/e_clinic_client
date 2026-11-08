import { activityLogRoute } from '@utilities/activity-log';
import { Routes } from '@angular/router';
import { accessGuard } from '@middlewares/guards/auth.guards';

/** `/chat` — staff chat (lazy). */
export const CHAT_ROUTES: Routes = [
  {
    path: '',
    title: 'Chat · e-Clinic',
    canMatch: [accessGuard('chat.read_own | chat.read_all')],
    loadComponent: () => import('@pages/communication/chat/chat.page').then((m) => m.ChatPage),
  },
];

/** `/support/tickets` — support tickets: the list (generic table) and one ticket. */
export const SUPPORT_ROUTES: Routes = [
  {
    path: 'tickets',
    canMatch: [accessGuard('tickets.read_own | tickets.read_all')],
    children: [
      {
        path: '',
        title: 'Support tickets · e-Clinic',
        loadComponent: () =>
          import('@pages/communication/ticket-list/ticket-list.page').then((m) => m.TicketListPage),
      },
      {
        path: ':id',
        title: 'Ticket · e-Clinic',
        data: activityLogRoute('support_ticket', 'tickets.read_all'),
        loadComponent: () =>
          import('@pages/communication/ticket-detail/ticket-detail.page').then(
            (m) => m.TicketDetailPage,
          ),
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'tickets' },
];
